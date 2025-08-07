import protobuf from 'protobufjs';
import { appStore } from '../store/app-store';
import type { Movie } from '../models/models';
import { authStore } from '../store/auth-store';

type EventCallback = (data: any) => void;

export default class WebSocketService {
    private socket: WebSocket | null = null;
    private ClientMessage: protobuf.Type | null = null;
    private ServerMessage: protobuf.Type | null = null;
    private listeners: EventCallback[] = [];
    private isConnected = false;
    private isConnecting = false;
    private reconnectIntervalId: NodeJS.Timeout | null = null;
    private readonly pollInterval = 3000;
    private manualDisconnect = false;
    private readonly maxRetries = 3;
    private retryAttempts = this.maxRetries;

    async connect(baseUrl: string, wsToken: string | null): Promise<void> {
        if (this.isConnected || this.isConnecting) return;

        this.isConnecting = true;

        try {
            const url = new URL(baseUrl);
            if (wsToken) url.searchParams.set('token', wsToken);

            if (!this.ClientMessage || !this.ServerMessage) {
                const protoSource = await fetch('/proto/ws.proto').then(res => res.text());
                const root = protobuf.parse(protoSource, { keepCase: true }).root;
                this.ClientMessage = root.lookupType('ws.ClientMessage');
                this.ServerMessage = root.lookupType('ws.ServerMessage');
            }

            await new Promise<void>((resolve, reject) => {
                this.socket = new WebSocket(url.toString());
                this.socket.binaryType = 'arraybuffer';

                this.socket.onopen = async () => {
                    console.log('✅ WebSocket connected');
                    this.isConnected = true;
                    this.retryAttempts = this.maxRetries;
                    await authStore.getState().setWSConnected(true);

                    if (this.reconnectIntervalId) {
                        clearInterval(this.reconnectIntervalId);
                        this.reconnectIntervalId = null;
                        console.log('🛑 Stopped reconnect polling');
                    }

                    resolve();
                };

                this.socket.onerror = async (error) => {
                    console.error('❌ WebSocket error:', error);
                    this.isConnected = false;
                    await authStore.getState().setWSConnected(false);
                    await appStore.getState().closeModal();
                    reject(error);
                };

                this.socket.onclose = async () => {
                    console.warn('🔌 WebSocket disconnected');
                    this.isConnected = false;
                    await authStore.getState().setWSConnected(false);
                    await appStore.getState().closeModal();
                    if (this.manualDisconnect) return this.manualDisconnect = false;
                    this.startReconnectPolling();
                };

                this.socket.onmessage = async (event: MessageEvent<ArrayBuffer>) => {
                    if (!this.ServerMessage) return;

                    try {
                        const rawData = new Uint8Array(event.data);
                        const decoded = this.ServerMessage.decode(rawData);
                        const msg = this.ServerMessage.toObject(decoded, {
                            defaults: false,
                            arrays: true,
                        });

                        if (msg.invitationNotification)
                            await appStore.getState().openReceivedInvitationModal(msg.invitationNotification.from);

                        if (msg.startMovieMatch) {
                            await appStore.getState().closeModal();
                            await appStore.getState().openStartMovieMatchModal(msg.startMovieMatch.movies);
                        }

                        if (msg.movieMatch) {
                            await appStore.getState().closeModal();
                            await appStore.getState().openMovieMatchModal(msg.movieMatch.movie);
                        }

                        this.listeners.forEach(cb => cb(msg));
                    } catch (e) {
                        console.error('❌ Failed to decode server message:', e);
                    }
                };
            });
        } finally {
            this.isConnecting = false;
        }
    }

    onMessage(callback: EventCallback) {
        this.listeners.push(callback);
    }

    private send(payload: object) {
        if (!this.ClientMessage || !this.socket || !this.isConnected || this.socket.readyState !== WebSocket.OPEN) {
            console.warn('🚫 Cannot send message: socket not ready');
            return;
        }
        const msg = this.ClientMessage.create(payload);
        const buffer = this.ClientMessage.encode(msg).finish();
        this.socket.send(buffer);
    }

    sendInvitationRequest(toTag: string) {
        this.send({ invitationRequest: { to: toTag } });
    }

    sendInvitationResponse(toTag: string, fromTag: string) {
        this.send({ invitationResponse: { to: toTag, from: fromTag } });
    }

    sendMovieSelection(movie: Movie) {
        this.send({ movieSelection: { movie } });
    }

    close(manual = false) {
        this.manualDisconnect = manual;
        this.socket?.close();
        this.isConnected = false;
        authStore.getState().setWSConnected(false);
        appStore.getState().closeModal();

        if (this.reconnectIntervalId) {
            clearInterval(this.reconnectIntervalId);
            this.reconnectIntervalId = null;
        }
    }

    private startReconnectPolling() {
        if (this.reconnectIntervalId) return;

        console.warn('🔁 Starting reconnect polling...');

        this.reconnectIntervalId = setInterval(async () => {
            if (this.retryAttempts <= 0) {
                clearInterval(this.reconnectIntervalId!);
                this.reconnectIntervalId = null;
                authStore.getState().logout();
                return;
            }

            try {
                await fetch('https://www.google.com/generate_204', { mode: 'no-cors' });

                this.retryAttempts--;
                await authStore.getState().refresh(); // Triggers WebSocket reconnect if authorized
            } catch {
                console.warn('📡 Still offline or network error');
                this.retryAttempts--;
            }
        }, this.pollInterval);
    }
}
