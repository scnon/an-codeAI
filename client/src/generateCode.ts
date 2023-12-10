import toast from "react-hot-toast";
import { WS_BACKEND_URL } from "./config";
import { USER_CLOSE_WEB_SOCKET_CODE } from "./constants";
import { io, Socket } from "socket.io-client";

const ERROR_MESSAGE =
  "Error generating code. Check the Developer Console AND the backend logs for details. Feel free to open a Github issue.";

const STOP_MESSAGE = "Code generation stopped";

export interface CodeGenerationParams {
  generationType: "create" | "update";
  image: string;
  resultImage?: string;
  history?: string[];
  // isImageGenerationEnabled: boolean; // TODO: Merge with Settings type in types.ts
}

export function generateCode(
  wsRef: React.MutableRefObject<WebSocket | Socket | null>,
  params: CodeGenerationParams,
  onChange: (chunk: string) => void,
  onSetCode: (code: string) => void,
  onStatusUpdate: (status: string) => void,
  onComplete: () => void
) {

  const wsUrl = `${WS_BACKEND_URL}/generate`;
  console.log("Connecting to backend @ ", wsUrl);

  const ws =  io('ws://localhost:3000', {
    path: '/generate',
  });

  wsRef.current = ws;
  console.log(USER_CLOSE_WEB_SOCKET_CODE, params, STOP_MESSAGE)
  new Promise((resolve) => {
    ws.on("connect", () => {
      resolve(true);
      // ws.emit(JSON.stringify(params));
    });
  }).then(() => {
    ws.emit('generatecode', params);
  })


  ws.on('generatecode', function(response) {
    if (response.type === "chunk") {
      onChange(response.value);
    } else if (response.type === "status") {
      onStatusUpdate(response.value);
    } else if (response.type === "setCode") {
      onSetCode(response.value);
    }  else if (response.type === "error") {
      console.error("Error generating code", response.value);
      toast.error(response.value);
    }
  });

  ws.on("disconnect", () => {
    // console.log("Connection closed", event.code, event.reason);
    // if (event.code === USER_CLOSE_WEB_SOCKET_CODE) {
    //   toast.success(STOP_MESSAGE);
    // } else if (event.code !== 1000) {
    //   console.error("WebSocket error code", event);
    //   toast.error(ERROR_MESSAGE);
    // }
    onComplete();
  });

  ws.on("error", (error) => {
    console.error("WebSocket error", error);
    toast.error(ERROR_MESSAGE);
  });

  // const wsUrl = `${WS_BACKEND_URL}/generate`;
  // console.log("Connecting to backend @ ", wsUrl);

  // const ws = new WebSocket(wsUrl);
  // wsRef.current = ws;

  // ws.addEventListener("open", () => {
  //   ws.send(JSON.stringify(params));
  // });

  // ws.addEventListener("message", async (event: MessageEvent) => {
  //   console.log('************', event)
  //   const response = JSON.parse(event.data);
  //   if (response.type === "chunk") {
  //     onChange(response.value);
  //   } else if (response.type === "status") {
  //     onStatusUpdate(response.value);
  //   } else if (response.type === "setCode") {
  //     onSetCode(response.value);
  //   } else if (response.type === "error") {
  //     console.error("Error generating code", response.value);
  //     toast.error(response.value);
  //   }
  // });
  // ws.addEventListener("close", (event) => {
  //   console.log("Connection closed", event.code, event.reason);
  //   if (event.code === USER_CLOSE_WEB_SOCKET_CODE) {
  //     toast.success(STOP_MESSAGE);
  //   } else if (event.code !== 1000) {
  //     console.error("WebSocket error code", event);
  //     toast.error(ERROR_MESSAGE);
  //   }
  //   onComplete();
  // });

  // ws.addEventListener("error", (error) => {
  //   console.error("WebSocket error", error);
  //   toast.error(ERROR_MESSAGE);
  // });
}