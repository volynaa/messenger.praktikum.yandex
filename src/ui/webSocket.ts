type EventCallback = (...args: unknown[]) => void;
export class WebSocketTransport {
    private socket: WebSocket | null = null;
    private readonly url: string;
    private pingInterval: number | null = null;
    private readonly pingIntervalTime: number;
    private eventListeners: Map<string, EventCallback[]> = new Map();

    public static readonly Connected = 'connected';
    public static readonly Close = 'close';
    public static readonly Error = 'error';
    public static readonly Message = 'message';

    constructor(url: string, pingIntervalTime: number = 30000) {
        this.url = url;
        this.pingIntervalTime = pingIntervalTime;
    }

    public on(event: string, callback: EventCallback): void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event)!.push(callback);
    }

    public off(event: string, callback: EventCallback): void {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    private emit(event: string, ...args: unknown[]): void {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    public send(data: string | number | object): void {
        if (!this.socket) {
            throw new Error('Socket is not connected');
        }

        const dataToSend = typeof data === 'string' ? data : JSON.stringify(data);
        this.socket.send(dataToSend);
    }

    public connect(): Promise<void> {
        if (this.socket) {
            const readyState = this.socket.readyState;
            if (readyState === WebSocket.CONNECTING || readyState === WebSocket.OPEN) {
                throw new Error('The socket is already connected or connecting');
            }
        }
        this.socket = new WebSocket(this.url);
        this.subscribe(this.socket);
        this.setupPing();

        return new Promise((resolve, reject) => {
            const errorHandler = (error: Error) => {
                this.off(WebSocketTransport.Connected, connectedHandler);
                reject(error);
            };

            const connectedHandler = () => {
                this.off(WebSocketTransport.Error, errorHandler);
                resolve();
            };

            this.on(WebSocketTransport.Error, errorHandler);
            this.on(WebSocketTransport.Connected, connectedHandler);
        });
    }

    public close(code?: number, reason?: string): void {
        if (this.socket) {
            this.socket.close(code, reason);
            this.socket = null;
        }

        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }

        this.eventListeners.clear();
    }

    public getReadyState(): number {
        return this.socket?.readyState ?? WebSocket.CLOSED;
    }

    public isConnected(): boolean {
        return this.socket?.readyState === WebSocket.OPEN;
    }

    private setupPing(): void {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
        }

        this.pingInterval = window.setInterval(() => {
            if (this.isConnected()) {
                this.send({ type: 'ping' });
            }
        }, this.pingIntervalTime);

        this.on(WebSocketTransport.Close, () => {
            if (this.pingInterval) {
                clearInterval(this.pingInterval);
                this.pingInterval = null;
            }
        });
    }

    private subscribe(socket: WebSocket): void {
        socket.addEventListener('open', () => {
            this.emit(WebSocketTransport.Connected);
        });

        socket.addEventListener('close', (event) => {
            this.emit(WebSocketTransport.Close, event);
        });

        socket.addEventListener('error', () => {
            this.emit(WebSocketTransport.Error, new Error('WebSocket error'));
        });

        socket.addEventListener('message', (message) => {
            try {
                const data = JSON.parse(message.data);

                if (['pong', 'user connected'].includes(data?.type)) {
                    return;
                }
                this.emit(WebSocketTransport.Message, data);
            } catch {
                this.emit(WebSocketTransport.Message, message.data);
            }
        });
    }
}
