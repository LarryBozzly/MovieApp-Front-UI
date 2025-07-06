import protobuf from 'protobufjs';
import { appStore } from '../store/app-store';
import type { Movie } from '../models/models';

type EventCallback = (data: any) => void;

export default class WebSocketService {
    private socket: WebSocket | null = null;
    private ClientMessage: protobuf.Type | null = null;
    private ServerMessage: protobuf.Type | null = null;
    private listeners: EventCallback[] = [];
    private isConnected: boolean = false;

    async connect(url: string) {
        const protoSource = await fetch('/proto/ws.proto').then(res => res.text());
        const root = protobuf.parse(protoSource, { keepCase: true }).root;

        this.ClientMessage = root.lookupType('ws.ClientMessage');
        this.ServerMessage = root.lookupType('ws.ServerMessage');

        return new Promise<void>((resolve, reject) => {
            this.socket = new WebSocket(url);
            this.socket.binaryType = 'arraybuffer';

            this.socket.onopen = () => {
                console.log('✅ WebSocket connected');
                this.isConnected = true;
                resolve();
            };

            this.socket.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                reject(error);
            };

            this.socket.onclose = () => {
                console.warn('🔌 WebSocket disconnected');
                this.isConnected = false;
            };

            this.socket.onmessage = async (event: MessageEvent<ArrayBuffer>) => {
                if (!this.ServerMessage) return;

                try {
                    const rawData = new Uint8Array(event.data);
                    const decoded = this.ServerMessage.decode(rawData);
                    // const msg = this.ServerMessage.toObject(decoded, { defaults: true });
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

    sendInvitationRequest(toTag: string) {
        if (!this.ClientMessage || !this.socket || !this.isConnected) {
            console.warn('🚫 Cannot send invite: socket not ready');
            return;
        }

        const msg = this.ClientMessage.create({
            invitationRequest: {
                to: toTag,
            },
        });

        const buffer = this.ClientMessage.encode(msg).finish();
        this.socket.send(buffer);
    }

    sendInvitationResponse(toTag: string, fromTag: string) {
        if (!this.ClientMessage || !this.socket || !this.isConnected) {
            console.warn('🚫 Cannot send invite: socket not ready');
            return;
        }

        const msg = this.ClientMessage.create({
            invitationResponse: {
                to: toTag,
                from: fromTag
            },
        });

        const buffer = this.ClientMessage.encode(msg).finish();
        this.socket.send(buffer);
    }

    sendMovieSelection(movie: Movie) {
        if (!this.ClientMessage || !this.socket || !this.isConnected) {
            console.warn('🚫 Cannot send invite: socket not ready');
            return;
        }

        const msg = this.ClientMessage.create({
            movieSelection: {
                movie,
            },
        });

        const buffer = this.ClientMessage.encode(msg).finish();
        this.socket.send(buffer);
    }

    close() {
        this.socket?.close();
    }
}
