import protobuf from 'protobufjs';
import { appStore } from '../store/app-store';
import type { Movie } from '../models/models';
import { authStore } from '../store/auth-store';


export default class WebSocketService extends EventTarget {
    private socket: WebSocket | null = null;
    private ClientMessage: protobuf.Type | null = null;
    private ServerMessageType: protobuf.Type | null = null;
    private isConnected = false;

    async loadProto() {
        const protoSource = await fetch('/proto/ws.proto').then(res => res.text());
        const root = protobuf.parse(protoSource, { keepCase: true }).root;

        this.ClientMessage = root.lookupType('ws.ClientMessage');
        this.ServerMessageType = root.lookupType('ws.ServerMessage');
    }

    async connect(baseUrl: string, wsToken: string | null): Promise<void> {
        if (!this.ClientMessage || !this.ServerMessageType) {
            await this.loadProto();
        }

        const url = new URL(baseUrl);
        if (wsToken) url.searchParams.set('token', wsToken);

        this.socket = new WebSocket(url.toString());
        this.socket.binaryType = 'arraybuffer';

        this.socket.onopen = () => {
            console.log('✅ WebSocket connected');
            this.isConnected = true;
            authStore.getState().setWSConnected(true);
            this.dispatchEvent(new CustomEvent('open'));
        };

        this.socket.onerror = (event) => {
            console.error('❌ WebSocket error:', event);
            this.isConnected = false;
            authStore.getState().setWSConnected(false);
            authStore.getState().refresh();
            this.dispatchEvent(new CustomEvent('error', { detail: event }));
        };

        this.socket.onclose = () => {
            console.warn('🔌 WebSocket disconnected');
            this.isConnected = false;
            authStore.getState().setWSConnected(false);
            authStore.getState().refresh();
            this.dispatchEvent(new CustomEvent('close'));
        };

        this.socket.onmessage = (event: MessageEvent<ArrayBuffer>) => {
            if (!this.ServerMessageType) return;

            try {
                const rawData = new Uint8Array(event.data);
                const decoded = this.ServerMessageType.decode(rawData);
                const msg = this.ServerMessageType.toObject(decoded, { defaults: false, arrays: true });

                if (msg.invitationNotification) {
                    appStore.getState().openReceivedInvitationModal(msg.invitationNotification.from);
                }
                if (msg.startMovieMatch) {
                    appStore.getState().closeModal();
                    appStore.getState().openStartMovieMatchModal(msg.startMovieMatch.movies);
                }
                if (msg.movieMatch) {
                    appStore.getState().closeModal();
                    appStore.getState().openMovieMatchModal(msg.movieMatch.movie);
                }

                this.dispatchEvent(new CustomEvent('message', { detail: msg }));
            } catch (e) {
                console.error('❌ Failed to decode server message:', e);
            }
        };

        return new Promise<void>((resolve, reject) => {
            const onOpen = (e: Event) => {
                cleanup();
                resolve();
            };
            const onError = (e: Event) => {
                cleanup();
                // Cast to CustomEvent to access 'detail'
                reject((e as CustomEvent).detail);
            };
            const cleanup = () => {
                this.removeEventListener('open', onOpen);
                this.removeEventListener('error', onError);
            };

            this.addEventListener('open', onOpen);
            this.addEventListener('error', onError);
        });
    }

    private sendMessage(payload: object) {
        if (!this.ClientMessage || !this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.warn('🚫 Cannot send message: socket not ready');
            return;
        }
        const message = this.ClientMessage.create(payload);
        const buffer = this.ClientMessage.encode(message).finish();
        this.socket.send(buffer);
    }

    sendInvitationRequest(toTag: string) {
        this.sendMessage({ invitationRequest: { to: toTag } });
    }

    sendInvitationResponse(toTag: string, fromTag: string) {
        this.sendMessage({ invitationResponse: { to: toTag, from: fromTag } });
    }

    sendMovieSelection(movie: Movie) {
        this.sendMessage({ movieSelection: { movie } });
    }

    close() {
        this.socket?.close();
        this.isConnected = false;
        this.dispatchEvent(new CustomEvent('close'));
    }

    get connected() {
        return this.isConnected;
    }
}
