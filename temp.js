

class EVmin {
	constructor(arg){
		this.weights = arg;
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
		const weights = this.weights;
		const indexb = this.indexb;
		const indexw = this.indexw;
		const num_shape = property.num_shape;
		const phase = Math.min(Math.max(10, board.stones-4), 60);
		let index = 0;
		let score = 0;
		let offset = num_shape*6561*phase;

		for(let i=0;i<num_shape;i++){
			const i8 = i*8;
			index = indexb[shape[i8+0]] + indexw[shape[i8+1]];
			score += weights[offset + index];
			index = indexb[shape[i8+2]] + indexw[shape[i8+3]];
			score += weights[offset + index];
			index = indexb[shape[i8+4]] + indexw[shape[i8+5]];
			score += weights[offset + index];
			index = indexb[shape[i8+6]] + indexw[shape[i8+7]];
			score += weights[offset + index];
			offset += 6561;
			if(isNaN(score)){
				window.errboard = board;
				throw new Error(`error score is NaN\noffset+index=${offset+index}, i=${i}`);
			}
		}
		
		if(isNaN(score)){
			window.errboard = board;
			throw new Error(`error score is NaN\nindex=${index}, offset=${offset}`);
		}
		return score/16;
	}
}

class AImin extends EVmin {
	constructor(arg){
		super(arg);
	}
	
	negaAlpha(node, alpha, beta, depth){
        const argnode = new BOARD(node);
		const search = (board, alpha, beta, depth)=>{
			if(depth===0){
				return this.evaluation(board)*board.turn;
			}
		
			const state = board.state();
			
			if(state===1){
				const children = board.expand();

				for(const child of children){
					child.e = -this.evaluation(child);
				}
				
				//move ordering
				if(board.stones<60){
					children.sort((a,b)=>{return b.e-a.e});
				}
				
				for(const child of children){
					alpha = Math.max(alpha, -search(child, -beta, -alpha, depth-1));
					if(alpha>=beta){return alpha;}
				}
				
				return alpha;
			}else if(state===2){ //pass
				const child = new BOARD(board);
				child.turn *= -1;
				return -search(child, -beta, -alpha, depth-1);
			}else{ //game finish
				return board.black_white()*board.turn;
			}
        }

        return search(argnode, alpha, beta, depth);
    }
}

