'use client'

import * as React from 'react';
import {Upload} from 'lucide-react';
import { useState } from 'react';

const FileUploadComponent:React.FC =() => {
    const [pdfStatus, setPdfStatus] = useState('');
    const handleFileUploadButton = () => {
        const el = document.createElement('input');
        el.setAttribute('type', 'file');
        el.setAttribute('accept', 'application/pdf');
        el.addEventListener('change', async (ev)=>{
            console.log(`ev ${ev} el ${el}`);
           if (el.files && el.files.length > 0 ) {
                const file = el.files.item(0);
                //calling the pdf upload on server using fetch
                const formData = new FormData();
                if (file){
                    formData.append('pdf', file);
                    const res=await fetch("http://localhost:8000/upload/pdf", {
                        method: 'POST',
                        body: formData
                    });
                    console.log(`res = ${JSON.stringify(res)}`);
                    setPdfStatus(JSON.stringify(res));
                }
                console.log(`file uploaded successfully ${JSON.stringify(file)}`);
            }
        });
        el.click();
    }
    return (
        <div>
            {pdfStatus}
        <div onClick={handleFileUploadButton} className='bg-slate-900 text-white p-4 rounded-lg shadow-2xl'>
            <div className='flex flex-col justify-center items-center'>
            <h3> Upload PDF File</h3>
            <Upload />
            </div>
        </div>
        </div>
    ); 
}

export default FileUploadComponent