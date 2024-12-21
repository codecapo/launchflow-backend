export interface UserAuthRequest {
  nonce: string;
}

export interface NegotiateClientRequest {
  walletAddress: string;
  clientId: string;
}

export interface Message {
  type: string;
  payload: string;
}

export interface SendMessageRequest {
  uci: string;
  message: Message;
}

export interface CloseConnectionRequest {
  uci: string;
  connectionId: string;
}

export interface CloseConnectionResponse {
  resultMessage: string;
  result: boolean;
}