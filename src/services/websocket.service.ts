import protobuf from 'protobufjs';
import { appStore } from '../store/app-store';
import type { FavoriteState, Movie } from '../models/models';
import { authStore } from '../store/auth-store';
import ConnectivityService from './connectivity.service'

type EventCallback = (data: any) => void;

export default class WebSocketService {
    private socket: WebSocket | null = null;
    private ClientMessage: protobuf.Type | null = null;
    private ServerMessage: protobuf.Type | null = null;
    private listeners: EventCallback[] = [];
    private isConnected = false;
    private isConnecting = false;
    private reconnectPromise: Promise<void> | null = null;
    private manualDisconnect = false;

    private connectivityService = ConnectivityService.getInstance();

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
                    await authStore.getState().setWSConnected(true);

                    this.stopReconnectPolling();
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

                        if (msg.favoriteMoviesUpdate) {
                            const mediaIds: number[] = msg.favoriteMoviesUpdate.mediaIds;
                            const currentFavorites = appStore.getState().favoritesIds;
                            const idsRecord: Record<number, FavoriteState> = {};
                            mediaIds.forEach((id) => {
                                if (!currentFavorites[id]?.isLoading) {
                                    idsRecord[id] = { isFavorite: true, isLoading: false };
                                }
                            });
                            appStore.getState().setFavoritesIds(idsRecord);
                        }

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

        this.stopReconnectPolling();
    }

    private startReconnectPolling(): void {
        if (this.reconnectPromise) return;

        console.warn('🔁 Starting passive reconnect wait...');

        const promise = this.connectivityService.waitForInternet()
            .then(async (isOnline) => {
                if (isOnline) {
                    console.log('✅ Network back online. Attempting re-authentication.');
                    await authStore.getState().refresh();
                } else {
                    console.log('🛑 Reconnect wait aborted.');
                }
            })
            .catch(() => {
                console.error('❌ Reconnect wait failed unexpectedly.');
            })
            .finally(() => {
                this.reconnectPromise = null;
            });

        this.reconnectPromise = promise;
    }

    private stopReconnectPolling() {
        this.connectivityService.abort();
        this.reconnectPromise = null;
        console.log('🛑 Stopped reconnect polling');
    }
}