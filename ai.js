//探査では、currentTurn から見た評価値が返される。

class AI extends EV {
	constructor(arg){
		super(arg);
		this.num_readnode = 0;
	}
	
	// negascout method こっちのほうが強い
	negaScout(node, alpha, beta, depth){
		const search = (node, alpha, beta, depth)=>{
			this.num_readnode++;
			if(depth===0){
				return this.evaluation(node)*node.turn;
			}
			let max = -128, v = 0;
			switch(node.state()){
				case 1:
					const children = node.expand();
					for(const child of children){
						child.e = this.evaluation(child)*node.turn;
					}
					//move ordering
					if(node.stones<60){
						children.sort((a,b)=>{return b.e-a.e});
					}

					max = v = -search(children[0], -beta, -alpha, depth-1);
					if(beta<=v){return v;} // cut
					if(alpha<v){alpha = v;}

					for(let i=1;i<children.length;i++){
						v = -search(children[i], -alpha-1, -alpha, depth-1);
						if(beta<=v){return v;}
						if(alpha<v){
							alpha = v;
							v = -search(children[i], -beta, -alpha, depth-1);
							if(beta<=v){return v;} // beta cut
							if(alpha<v){alpha = v;}
						}
						if(max<v){max = v;}
					}
					return max;
				case 2:
					const child = new BOARD(node);
					child.turn *= -1;
					return -search(child, -beta, -alpha, depth-1);
				case 3:
					return node.black_white()*node.turn;
			}
		}
		return search(node, alpha, beta, depth);
	}

	// negaalpha method
	negaAlpha(node, alpha, beta, depth){
		const search = (node, alpha, beta, depth)=>{
			this.num_readnode++;
			if(depth===0){
				return this.evaluation(node)*node.turn;
			}
			switch(node.state()){
				case 1:
					const children = node.expand();
					for(const child of children){
						child.e = this.evaluation(child)*node.turn;
					}
					// move ordering
					if(node.stones<60){
						children.sort((a,b)=>{return b.e-a.e});
					}
					for(const child of children){
						alpha = Math.max(alpha, -search(child, -beta, -alpha, depth-1));
						if(alpha>=beta){return alpha;} // cut
					}
					return alpha;
				case 2:
					const child = new BOARD(node);
					child.turn *= -1;
					return -search(child, -beta, -alpha, depth-1);
				case 3:
					return node.black_white()*node.turn;
			}
		}
		return search(node, alpha, beta, depth);
	}

	async cpuHand(node, alpha=-100, beta=100, depth=0, showStatus=false, showSearching=false){
		const startTime = performance.now();
		const children = node.expand();
		this.num_readnode = 0;

		if(children.length===0){
			return [];
		}
		for(const child of children){
			// どこにおいたかをメモる
			child.hand1 = (node.black1|node.white1)^(child.black1|child.white1);
			child.hand2 = (node.black2|node.white2)^(child.black2|child.white2);
			// calc eval of child
			child.e = -this.negaScout(child, alpha, beta, depth)//*master.now.turn;

			if(showSearching){
				await master.showSearchingCell(child.hand1, child.hand2);
			}
		}
		// sort
		children.sort((a,b)=>{return b.e-a.e;});
		
		const score = children[0].e;
		
		//最大値の中からランダムに選ぶ
		let flag = false;
		for(let i=1;i<children.length;i++){
			if(~~children[0].e===~~children[i].e){
				flag = true;
			}else{
				if(flag){
					const random = ~~(Math.random()*(i-1));
					const temp = children[0];
					children[0] = children[random];
					children[random] = temp;
				}
				break;
			}
		}
		
		const process_time = ((performance.now()-startTime)/1000).toPrecision(4);
		const node_per_second = ((this.num_readnode/process_time)/1000).toPrecision(4);
		if(showStatus){
			console.log(`read ${this.num_readnode} nodes\nprocess time ${process_time} s\n${node_per_second} knps\nscore ${score}`);
		}
		
		return children;
	}
	
	// returns random hand
	randomHand(board){
		const hands = [];
		const mask1 = 0x00003c3c;
		const mask2 = 0x3c3c0000;
		let legalhand = board.getMove();

		const x_mask1 = ~0x42c30000;
		const x_mask2 = ~0x0000c342;

		if(Math.random()>0.1){
			legalhand[0] &= x_mask1;
			legalhand[1] &= x_mask2;
		}
		if(legalhand[0]===0 && legalhand[1]===0){
			legalhand = board.getMove();
		}
		
		while(legalhand[0]){
			const bit = -legalhand[0] & legalhand[0];
			hands.push([bit, 0]);
			legalhand[0] = legalhand[0] ^ bit;
		}
		while(legalhand[1]){
			const bit = -legalhand[1] & legalhand[1];
			hands.push([0, bit]);
			legalhand[1] = legalhand[1] ^ bit;
		}
		
		let random_index;
		
		for(let i=0;i<3;i++){
			random_index= ~~(Math.random()*hands.length);
			if((hands[random_index][0]&mask1)|(hands[random_index][1]&mask2)){
				return hands[random_index];
			}
		}
		
		return hands[random_index];
	}	
}