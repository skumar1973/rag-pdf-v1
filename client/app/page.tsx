import Image from "next/image";
import FileUploadComponent from "./components/file-upload";
import ChatComponent from "./components/chat";

export default function Home() {
  return (
   <div className="min-h-screen w-screen flex">
    <div className="w-[30vw] min-h-screen flex flex-cols justify-center items-center">
      <FileUploadComponent />
    </div>
    <div className="w-[70vw] min-h-screen border-l-2">
      <ChatComponent />
    </div>
   </div>
  );
}
