export interface NetworkRequest {
  type: "move" | "route";
  nodeName?: string;
  edgeName?: string;
}

export interface NetworkResponse {
  status: "ok" | "fu";
  message?: string;
}

/**
 * Collection of methods a client can use to make requests to a Network
 */
export interface NetworkClient<ClientType> {
  client: ClientType;
  request(request: NetworkRequest): NetworkResponse;
}