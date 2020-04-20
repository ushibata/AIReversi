!function(){var a={RESOLVE:"resolve",NOTIFY:"notify"},b='onmessage = function(e){ postMessage({type:"'+a.RESOLVE+'",content:({{#CODE}}).call(this, (e.data ? JSON.parse(e.data) : undefined))});};function notify(c){postMessage({type:"'+a.NOTIFY+'", content:c})}',c=function(a){return b.replace("{{#CODE}}",a)};window.Thread=function(){var b=function(){this.resolveQueues=[],this.rejectQueues=[],this.progressQueues=[],this.args=null,this.isDone=!1,this.isFailed=!1};b.prototype.done=function(a){return this.isDone?a(this.args):this.resolveQueues.push(a),this},b.prototype.fail=function(a){return this.isFailed?a(this.args):this.rejectQueues.push(a),this},b.prototype.always=function(a){return this.isFailed||this.isDone?a(this.args):(this.resolveQueues.push(a),this.rejectQueues.push(a)),this},b.prototype.progress=function(a){this.progressQueues.push(a)},b.prototype.resolve=function(a){return this.isDone=!0,this.args=a,this.resolveQueues.forEach(function(b){b(a)}),this},b.prototype.notify=function(a){this.progressQueues.forEach(function(b){b(a)})},b.prototype.reject=function(a){return this.isFailed=!0,this.args=a,this.rejectQueues.forEach(function(b){b(a)}),this};var d=function(d,e){if(!window.Blob||!window.URL||!window.Worker)throw new Error("this browser is not supported");e=e||[],e instanceof window.Array||(e=[e]);var f="";e.length>0&&(f='importScripts("'+e.join('","')+'");');var g=new window.Blob([f+c(d.toString())]);this.blobUrl=window.URL.createObjectURL(g),this.worker=new window.Worker(this.blobUrl),this.deferred=new b;var h=this;this.worker.addEventListener("message",function(b){switch(b.data.type){case a.RESOLVE:return void h.deferred.resolve(b.data.content);case a.NOTIFY:return void h.deferred.notify(b.data.content)}}),this.worker.addEventListener("error",function(a){h.deferred.reject(a)})};return d.prototype.execute=function(a){if(this.isClosed)throw new Error("thread has been closed.");var b=JSON.stringify(a);return this.worker.postMessage(b),this},d.prototype.once=function(a){var b=this;return this.deferred.always(function(){b.terminate()}),this.execute(a),this.isClosed=!0,this},d.prototype.terminate=function(){window.URL.revokeObjectURL(this.blobUrl),this.worker.terminate(),this.worker=null,this.deferred=null,this.blobUrl=null},d.prototype.done=function(a){return this.deferred.done(a),this},d.prototype.fail=function(a){return this.deferred.fail(a),this},d.prototype.progress=function(a){return this.deferred.progress(a),this},d}()}();
//# sourceMappingURL=thread.min.js.map