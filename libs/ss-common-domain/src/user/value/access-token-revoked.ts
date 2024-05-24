export class AccessTokenRevoked {
  private readonly _walletAddress: string;
  private readonly _revoked: boolean;

  get revoked(): boolean {
    return this._revoked;
  }

  get walletAddress(): string {
    return this._walletAddress;
  }

  constructor(walletAddress: string, revoked: boolean) {
    this._walletAddress = walletAddress;
    this._revoked = revoked;
  }
}
