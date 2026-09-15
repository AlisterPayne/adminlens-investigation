"use client";

import MessagesChat from "./messages-chat";
import MessagesFooter from "./messages-footer";
import MessagesHeader from "./messages-header";

export default function MessagesBody() {
  return (
    <div className="flex grow flex-col transition-transform duration-300 ease-in-out md:translate-x-0">
      <MessagesHeader />
      <MessagesChat />
      <MessagesFooter />
    </div>
  );
}
