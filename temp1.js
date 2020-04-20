
self.addEventListener('message', e=>{
    const buffer  = e.data.buffer;
    const id = e.data.id;

    const w = new Int8Array(buffer);

    
    
    self.postMessage(weights[id]);

    self.close();
});




