import { Status } from "@/utils";

/**
 * Collection of methods a client can use to make requests to a Network
 */
export interface NetworkClient<ClientType> {
  client: ClientType;
  request(request: NetworkRequest): NetworkResponse;
}

export interface NetworkRequest {
  type: "move" | "route";
  nodeName?: string;
  edgeName?: string;
}

export interface MoveRequest {
  type: "move";
  edgeName: string;
}

export function isMove(request: NetworkRequest): request is MoveRequest {
  return request.type === "move";
}

export interface NetworkResponse {
  status: Status;
  message?: string;
  errorName?: string;
  errorMessage?: string;
}

export interface ErrorResponse extends NetworkResponse {
  status: "fu";
  errorName: string;
  errorMessage: string;
}

export function responseFromError(error: unknown): ErrorResponse {
  const status = "fu";

  if (error instanceof Error) {
    return { status, errorName: error.name, errorMessage: error.message };
  }

  console.warn("Creating ErrorResponse from non-Error object", error);

  return { status, errorName: "Unexpected error", errorMessage: String(error) };
}

