/**
 * A service for handling BroadcastChannel communication.
 * This service uses a singleton pattern, but manages separate instances for each channel name.
 */
class BroadcastChannelService<T> {
  private static instances: Map<string, BroadcastChannelService<any>> = new Map();

  private channel: BroadcastChannel;
  private readonly channelName: string;

  private constructor(channelName: string) {
    this.channelName = channelName;
    this.channel = new BroadcastChannel(channelName);
  }

  /**
   * Gets a singleton instance of the BroadcastChannelService for a specific channel name.
   * @param channelName The name of the broadcast channel.
   * @returns A singleton instance of the service.
   */
  public static getInstance<U>(channelName: string): BroadcastChannelService<U> {
    if (!this.instances.has(channelName)) {
      const instance = new BroadcastChannelService<U>(channelName);
      this.instances.set(channelName, instance);
    }
    return this.instances.get(channelName) as BroadcastChannelService<U>;
  }

  /**
   * Posts a message to the broadcast channel.
   * @param message The message to post.
   */
  public postMessage(message: T): void {
    this.channel.postMessage(message);
  }

  /**
   * Listens for messages on the broadcast channel.
   * @param callback The callback function to execute when a message is received.
   */
  public onMessage(callback: (data: T) => void): void {
    this.channel.onmessage = (event: MessageEvent<T>) => {
      callback(event.data);
    };
  }

  /**
   * Closes the broadcast channel and removes the instance from the service.
   */
  public close(): void {
    this.channel.close();
    BroadcastChannelService.instances.delete(this.channelName);
  }
}

export default BroadcastChannelService;
