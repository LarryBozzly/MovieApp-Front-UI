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
    private isConnected: boolean = false;

    async connect(baseUrl: string, wsToken: string | null) {
        let url = new URL(baseUrl);
        if (wsToken) url.searchParams.set('token', wsToken);

        const protoSource = await fetch('/proto/ws.proto').then(res => res.text());
        const root = protobuf.parse(protoSource, { keepCase: true }).root;

        this.ClientMessage = root.lookupType('ws.ClientMessage');
        this.ServerMessage = root.lookupType('ws.ServerMessage');

        return new Promise<void>((resolve, reject) => {
            this.socket = new WebSocket(url.toString());
            this.socket.binaryType = 'arraybuffer';

            this.socket.onopen = async () => {
                console.log('✅ WebSocket connected');
                this.isConnected = true;
                await authStore.getState().setWSConnected(true);
                resolve();
            };

            this.socket.onerror = async (error) => {
                console.error('❌ WebSocket error:', error);
                this.isConnected = false;
                await authStore.getState().setWSConnected(false);
                reject(error);
                await authStore.getState().refresh();
            };

            this.socket.onclose = async () => {
                console.warn('🔌 WebSocket disconnected');
                this.isConnected = false;
                await authStore.getState().setWSConnected(false);
                await authStore.getState().refresh();
            };

            this.socket.onmessage = async (event: MessageEvent<ArrayBuffer>) => {
                if (!this.ServerMessage) return;

                try {
                    const rawData = new Uint8Array(event.data);
                    const decoded = this.ServerMessage.decode(rawData);
                    const msg = this.ServerMessage.toObject(decoded, { defaults: false, arrays: true });

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

    close() {
        this.socket?.close();
        this.isConnected = false;
        authStore.getState().setWSConnected(false);
    }
}
