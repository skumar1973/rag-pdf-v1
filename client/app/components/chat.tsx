'use client'

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card,  CardContent, CardHeader} from "@/components/ui/card";

import * as React from 'react'

interface Doc {
    pageContent: string;
    metadata?: {
        loc?: {
            pageNumber?: number;
        },
        source?: string;
    }
};

interface IMessage {
    role : 'assistant' | 'user';
    content?: string;
    documents?: Doc[];         
}

const ChatComponent:React.FC = () => {

    const [message, setMessage] = React.useState<string>('');
    const [messages, setMessages] = React.useState<IMessage[]>([]);

    const handleSendChatMessage = async () => {
        setMessages((prev) => [...prev, { role : 'user', content : message }]);
        // console.log(`message: ${message}`);
        const res = await fetch(`http://localhost:8000/chat?message=${message}`);
        const data = await res.json();
        // console.log("send query to server.", message);
        // console.log(" data from server ", {data});
        setMessages((prev) => [...prev, { role: 'assistant', content: data?.message , documents: data?.docs}]);
    };
    return (
        <div className="p-4">
            <div>
                {messages.map((message, index) => 
                <Card key={index}> 
                    <CardContent>
                        <span>{message?.role}</span>
                        <p> {message?.content} </p>
                    </CardContent> 
                </Card>
                )}
            </div>
            <div className="fixed bottom-4 w-100 gap-3 flex">
                <Input type='text' value={message} onChange={(e)=>setMessage(e.target.value)} placeholder='type your message here'/>
                <Button disabled={!message.trim()} onClick={handleSendChatMessage}> Send</Button>
            </div>
        </div>
    );
}

export default ChatComponent