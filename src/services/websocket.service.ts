import protobuf from 'protobufjs';
import { appStore } from '../store/app-store';
import { WebSocketStatus, type Movie } from '../models/models';
import { authStore } from '../store/auth-store';

type EventCallback = (data: any) => void;

export default class WebSocketService {
    private status: WebSocketStatus = WebSocketStatus.DISCONNECTED;
    private pingIntervalId: number | null = null;
    private pongTimeoutId: number | null = null;
    private readonly pingIntervalMs = 10000;
    private readonly pongTimeoutMs = 5000;

    private socket: WebSocket | null = null;
    private ClientMessage: protobuf.Type | null = null;
    private ServerMessage: protobuf.Type | null = null;
    private listeners: EventCallback[] = [];
    private isConnected: boolean = false;

    getStatus() {
        return this.status;
    }

    private setStatus(newStatus: WebSocketStatus) {
        if (this.status !== newStatus) {
            this.status = newStatus;
            const isWSConnected = newStatus === WebSocketStatus.CONNECTED;
            authStore.getState().setWSConnected(isWSConnected);
            console.log(`🔄 WebSocket status changed: ${newStatus}`);
        }
    }

    private startPing() {
        if (!this.ClientMessage || !this.socket) return;

        this.pingIntervalId = window.setInterval(() => {
            if (this.socket?.readyState !== WebSocket.OPEN) return;

            const pingMsg = this.ClientMessage!.create({ ping: {} });
            const buffer = this.ClientMessage!.encode(pingMsg).finish();
            this.socket.send(buffer);

            this.pongTimeoutId = window.setTimeout(() => {
                console.warn('⚠️ Pong not received — closing socket');
                this.setStatus(WebSocketStatus.DISCONNECTED);
                this.close();
            }, this.pongTimeoutMs);
        }, this.pingIntervalMs);
    }

    private stopPing() {
        if (this.pingIntervalId) clearInterval(this.pingIntervalId);
        if (this.pongTimeoutId) clearTimeout(this.pongTimeoutId);
    }

    async connect(baseUrl: string, wsToken: string | null) {
        this.setStatus(WebSocketStatus.CONNECTING);

        const url = new URL(baseUrl);
        if (wsToken) url.searchParams.set('token', wsToken);

        const protoSource = await fetch('/proto/ws.proto').then(res => res.text());
        const root = protobuf.parse(protoSource, { keepCase: true }).root;

        this.ClientMessage = root.lookupType('ws.ClientMessage');
        this.ServerMessage = root.lookupType('ws.ServerMessage');

        return new Promise<void>((resolve, reject) => {
            this.socket = new WebSocket(url.toString());
            this.socket.binaryType = 'arraybuffer';

            this.socket.onopen = () => {
                console.log('✅ WebSocket connected');
                this.isConnected = true;
                this.setStatus(WebSocketStatus.CONNECTED);
                this.startPing();
                resolve();
            };

            this.socket.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                this.setStatus(WebSocketStatus.DISCONNECTED);
                this.stopPing();
                reject(error);
            };

            this.socket.onclose = () => {
                console.warn('🔌 WebSocket disconnected');
                this.isConnected = false;
                this.setStatus(WebSocketStatus.DISCONNECTED);
                this.stopPing();
            };

            this.socket.onmessage = async (event: MessageEvent<ArrayBuffer>) => {
                if (!this.ServerMessage) return;

                try {
                    const rawData = new Uint8Array(event.data);
                    const decoded = this.ServerMessage.decode(rawData);
                    const msg = this.ServerMessage.toObject(decoded, { defaults: false, arrays: true });

                    if (msg.pong) {
                        clearTimeout(this.pongTimeoutId!);
                        this.setStatus(WebSocketStatus.CONNECTED);
                        return;
                    }

                    if (msg.invitationNotification) await appStore.getState().openReceivedInvitationModal(msg.invitationNotification.from);

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
    }

    onMessage(callback: EventCallback) {
        this.listeners.push(callback);
    }

    sendInvitationRequest(toTag: string) {
        if (!this.ClientMessage || !this.socket || !this.isConnected) {
            console.warn('🚫 Cannot send invite: socket not ready');
            return;
        }

        const msg = this.ClientMessage.create({
            invitationRequest: { to: toTag },
        });

        const buffer = this.ClientMessage.encode(msg).finish();
        this.socket.send(buffer);
    }

    sendInvitationResponse(toTag: string, fromTag: string) {
        if (!this.ClientMessage || !this.socket || !this.isConnected) {
            console.warn('🚫 Cannot send response: socket not ready');
            return;
        }

        const msg = this.ClientMessage.create({
            invitationResponse: { to: toTag, from: fromTag },
        });

        const buffer = this.ClientMessage.encode(msg).finish();
        this.socket.send(buffer);
    }

    sendMovieSelection(movie: Movie) {
        if (!this.ClientMessage || !this.socket || !this.isConnected) {
            console.warn('🚫 Cannot send movie selection: socket not ready');
            return;
        }

        const msg = this.ClientMessage.create({
            movieSelection: { movie },
        });

        const buffer = this.ClientMessage.encode(msg).finish();
        this.socket.send(buffer);
    }

    close() {
        this.stopPing();
        this.socket?.close();
    }
}
