import { MessageCircle } from "lucide-react";
import EmptyState from "@/components/EmptyState";

const Chat = () => {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Chat</h2>
      </div>
      <EmptyState
        icon={MessageCircle}
        title="Sin mensajes aún"
        description="Inicia la conversación con tu grupo de viaje."
      />
    </div>
  );
};

export default Chat;
