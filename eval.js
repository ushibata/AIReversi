
class WEIGHTS_MANAGER{
	constructor(){
		const buffer = new ArrayBuffer(6561*property.num_phase*property.num_shape);

		this.buffer = buffer;
		this.weights = new Int8Array(buffer);
	}

	exportPng(){
        const d2p = new data2png();
		d2p.width = 6561/3;
		const newarr = new Uint8ClampedArray(this.weights.length);
		for(let i=0;i<this.weights.length;i++){
			newarr[i] = this.weights[i] + 128;
		}
        d2p.toPng(newarr);
	}

	loadPng(){
		const func = ()=>{
			const newarr = new Int8Array(this.buffer);
			for(let i=0;i<this.buffer.byteLength;i++){
				newarr[i] = d2p.array[i] - 128;
			}
			this.weights = newarr;			
		};
		const d2p = new data2png();
		const size = property.num_phase*property.num_shape*6561;
		d2p.loadPng('weights.png', func, size);
	}
}
const weights_manager = new WEIGHTS_MANAGER();
weights_manager.loadPng();



class EV {
	constructor(){
		this.weights = weights_manager.weights;
        
		// generate index table
		this.indexb = new Uint16Array(256);
		this.indexw = new Uint16Array(256);
		for(let i=0;i<256;i++){
			this.indexb[i] = parseInt(parseInt(i.toString(2),10)*2, 3);
			this.indexw[i] = this.indexb[i]/2;
		}
	}
	
	evaluation(board){
		const shape = board.shape();
		//最初20手は同じ重み、残りは4手ごと
		const phase = board.stones<=24 ? 0 : Math.floor((board.stones-25)/4) + 1;
		let score = 0;
		let offset = property.num_shape*6561*phase;

		for(let i=0;i<property.num_shape*8;i+=8){
			score += this.weights[offset + this.indexb[shape[i+0]] + this.indexw[shape[i+1]]];
			score += this.weights[offset + this.indexb[shape[i+2]] + this.indexw[shape[i+3]]];
			score += this.weights[offset + this.indexb[shape[i+4]] + this.indexw[shape[i+5]]];
			score += this.weights[offset + this.indexb[shape[i+6]] + this.indexw[shape[i+7]]];
			offset += 6561;
			if(isNaN(score)){
				window.errorboard=board;
				throw ""
			}
		}
		
		return score/16;
	}
	
	updateWeights(board, e){
		const shape = board.shape();
		//最初20手は同じ重み、残りは4手ごと
		const phase = board.stones<=24 ? 0 : Math.floor((board.stones-25)/4) + 1;
		let offset = property.num_shape*6561*phase;
		
		const y = e;//accurate evaluation of this node
		const W = this.evaluation(board);//predicted evaluation of this node
		const delta = (y - W)*property.learning_rate;

		for(let i=0;i<property.num_shape*8;i+=8){
			this.weights[offset + this.indexb[shape[i+0]] + this.indexw[shape[i+1]]] += delta;
			this.weights[offset + this.indexb[shape[i+2]] + this.indexw[shape[i+3]]] += delta;
			this.weights[offset + this.indexb[shape[i+4]] + this.indexw[shape[i+5]]] += delta;
			this.weights[offset + this.indexb[shape[i+6]] + this.indexw[shape[i+7]]] += delta;
			offset += 6561;
		}
	}
	
	async trainOne(s=0, n=64, depth=-1){
		let count = 0, loss = 0;
		// 重みを入れ替え
		const temp = this.weights;
		this.weights = new Float32Array(6561*property.num_phase*property.num_shape);
		this.weights.set(temp);
		
		//最小値と最大値を整える
		n = Math.min(Math.max(~~n, 4), 64);
		
		const startTime = performance.now();
		while(true){
			const node = await develop.generateNode(n);
			const nodes = new Array(8);
			nodes[0] = node;
			nodes[1] = nodes[0].rotate();
			nodes[2] = nodes[1].rotate();
			nodes[3] = nodes[2].rotate();
			nodes[4] = nodes[0].flip();
			nodes[5] = nodes[4].rotate();
			nodes[6] = nodes[5].rotate();
			nodes[7] = nodes[6].rotate();

			const true_value = ai.negaScout(node, -100, 100, depth);
			const pred_value = this.evaluation(node);

			for(const n of nodes){
				this.updateWeights(n, true_value);
			}
			
			loss += (true_value - pred_value)**2;
			count++;

			const endTime = performance.now();
			if(endTime - startTime>s){ break; }
		}
		
		for(let i=0;i<this.weights.length;i++){
			this.weights[i] = Math.min(Math.max(this.weights[i], -128), 127);
		}
		temp.set(this.weights);
		this.weights = temp;
		console.log(`complete ${count} trainings\nloss ${Math.sqrt(loss/count).toPrecision(4)}`);
	}
}