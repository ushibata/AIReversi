

class GRAPHIC {
	constructor(){}

	render(node=this.now){
		
		let black = 0;
		let white = 0;
		const board = node.board;
		
		//評価値を消す
		for(let value of display.circles){
			value.innerText = '';
		}

		//最後に置いた場所を消す
		for(const item of display.squares){
			const list = item.classList;
			list.remove("lastput");
			list.remove("eval_plus");
			list.remove("eval_minus");
		}

		//石を消す
		for(const item of display.circles){
			const list = item.classList;
			list.remove("black");
			list.remove("white");
			list.remove("blank");
			list.remove("searching");
			list.remove("legal");
		}
		
		//石の数をカウント
		for(let i=0;i<64;i++){
			if(board[i]===1){
				black++;
			}else if(board[i]===-1){
				white++;
			}
		}
		
		//石を置く
		for(let i=0;i<64;i++){
			const t = display.circles[i].classList;
			if(board[i]===1){
				t.add("black");
			}else if(board[i]===-1){
				t.add("white");
			}else{
				t.add("blank")
			}
		}
		
		display.black_score.innerText = black;
		display.white_score.innerText = white;

		if(property.mode==="setup"){
			return;
		}
		
		if(node.turn!==property.colorOfCpu){
			display.comment.innerText = 'player turn';
		}else{
			display.comment.innerText = 'cpu turn';
		}
		
		if(node.state()===3){//終局
			if(black > white){
				display.comment.innerText = 'black win';
			}else if(black < white){
				display.comment.innerText = 'white win';
			}else{
				display.comment.innerText = 'draw';
			}
			
			return;
		}
	}
	
	async showEval(node=this.now, alpha=-100,beta=100, depth){
		
		const search_depth = (!depth)?(property.depth_last>=64-node.stones ? -1 : property.depth):depth;
		const evals = await ai.cpuHand(node, alpha, beta, search_depth, 1, 1);

		if(evals.length===0){
			return;
		}

		// delete former evels
		for(const element of display.circles){
			element.innerText = '';
		}

		for(const node of evals){
			let put = 0;
			if(node.hand1<0){
				put = 0;
			}else if(node.hand1>0){
				put = 31-Math.log2(node.hand1);
			}
			if(node.hand2<0){
				put = 32;
			}else if(node.hand2>0){
				put = 63-Math.log2(node.hand2);
			}

			const circle = display.circles[put];
			circle.classList.remove("legal");
			circle.classList.remove("searching");
			circle.classList.remove("eval_plus");
			circle.classList.remove("eval_minus");
			if(node.e>0){
				circle.classList.add("eval_plus");
				circle.innerText = (node.e + '').slice(0, 5);
			}else{
				circle.classList.add("eval_minus");
				circle.innerText = (node.e + '').slice(0, 5);
			}
		}
		
		return;
	}
	
	showMove(node=this.now){
		for(const item of display.squares){
			item.classList.remove("legal");
		}

		let [move1, move2] = node.getMove();
		const board = new Array();
		
		for(let i=0;i<64;i++){
			board[i] = 0;
		}
		
		for(let i=31;i>-1;i--){
			if(move1&1 === 1){
				board[i] = 1;
			}
			move1 = move1 >>> 1;
		}
		for(let i=63;i>31;i--){
			if(move2&1 === 1){
				board[i] = 1;
			}
			move2 = move2 >>> 1;
		}
		
		for(let i=0;i<64;i++){
			if(board[i]===1){
				display.circles[i].classList.add("legal");
			}
		}
	}

	async showSearchingCell(hand1, hand2){
		let x, y;
		if(hand1<0){
			y = 0;
			x = 0;
		}else if(hand1>0){
			const e = 31 - Math.log2(hand1);
			y = ~~(e/8);
			x = e%8;
		}
		if(hand2<0){
			y = 4;
			x = 0;
		}else if(hand2>0){
			const e = 63 - Math.log2(hand2);
			y = ~~(e/8);
			x = e%8;
		}
		
		//handが定義されていない場合
		if(isNaN(x*y)){
			throw new Error("okasii yo");
		}
		display.circles[y*8+x].classList.add("searching");
		
		await new Promise(resolve=>{setTimeout(()=>{
			resolve();
		}, 0);});
	}
	
	showHand(node=this.now){
		// this.nowにhandプロパティがなかったら
		if(node.hand1===0 && node.hand2===0){
			for(let i=0;i<64;i++){
				if(display.squares[i].classList.contains("lastput")){
					display.squares[i].classList.remove("lastput");;
				}
			}
			return;
		}
		
		let x, y;
		if(node.hand1<0){
			y = 0;
			x = 0;
		}else if(node.hand1>0){
			const e = 31 - Math.log2(node.hand1);
			y = ~~(e/8);
			x = e%8;
		}
		if(node.hand2<0){
			y = 4;
			x = 0;
		}else if(node.hand2>0){
			const e = 63 - Math.log2(node.hand2);
			y = ~~(e/8);
			x = e%8;
		}
		
		//handが定義されていない場合
		if(isNaN(x*y)){
			return;
			//throw new Error("okasii yo");
		}
		display.squares[y*8+x].classList.add("lastput");
	}
}



class MASTER extends GRAPHIC {
	constructor(){
		super();
		this.mode = 'gameb';
		this.record = [new BOARD()];
	}

	
	//最新のBoardを返す
	get now(){
		return this.record[this.record.length - 1];
	}
	
	//ゲームを進行する
	async play(hand1=0, hand2=0){
		const [move1, move2] = this.now.getMove();
		//handle illegal hand
		if((hand1|hand2) && !(move1&hand1) && !(move2&hand2)){
			console.error(`error (${hand1}, ${hand2}) is illegal hand`);
			return;
		}

		const player_turn = async ()=>{
			if(this.now.turn!==property.colorOfCpu){
				const newNode = this.now.putStone(hand1, hand2);
				newNode.hand1 = hand1;
				newNode.hand2 = hand2;
				this.record.push(newNode);
			}
			await new Promise(resolve=>{setTimeout(()=>{
				resolve();
			}, 0);});
		};
		
		const cpu_turn = async ()=>{
			if(this.now.state()===1){
				const search_depth = property.depth_last>=64-this.now.stones ? -1 : property.depth;

				const move = await ai.cpuHand(this.now, property.alpha, property.beta, search_depth, true, true);
				this.record.push(move[0]);
			}
			if(this.now.state()===2){
				const newNode = new BOARD(this.now);
				newNode.turn *= -1;
				this.record[this.record.length-1] = newNode;
				if(this.now.turn===property.colorOfCpu){
					property.player_state_pass = true;
					display.pass.style.display = "block";
					window.stop();
				}
			}
			await new Promise(resolve=>{setTimeout(()=>{
				resolve();
			}, 0);});
		};
		
		const render = async ()=>{
			this.render(this.now);
			this.showMove(this.now);
			this.showHand(this.now);
			await new Promise(resolve=>{setTimeout(()=>{
				resolve();
			}, 40);});
		};
		
		await player_turn();
		await render();
		await cpu_turn();
		await render();
		
		return;
	}

	undo(){
		if(this.record.length<3){
			return;
		}
		this.record.pop();
		while(true){
			if(this.record[this.record.length-1].turn===property.colorOfCpu){
				this.record.pop();
			}else{
				break;
			}
		}
		this.render();
		this.showMove();
		this.showHand();
	}

	restart(){
		this.record = [new BOARD()];
		this.render(this.now);
		this.showMove();
	}
}



class DEVELOP extends MASTER{
    constructor(){
        super();
    }


    getSelfPlayGame(){
		const nodes = [];
		const history = [new BOARD()];
		
		while(true){
            const state = history.slice(-1)[0].state();
			
			if(state===1){
                const now = history.slice(-1)[0];
				const move = ai.cpuHand(now, -100, 100, 4);
				const rand = ~~(Math.random()*Math.min(move.length, 2));
                const child = now.putStone(move[rand].hand1, move[rand].hand2);
                history.push(child);
                
				for(let i=0;i<move.length;i++){
                    nodes.push(move[i]);
                }
			}else if(state===2){
				history.slice(-1)[0].turn *= -1;
			}else{
				break;
			}
		}
			
		for(let i=0;i<nodes.length;i++){
			nodes[i].e *= -1;
			if(nodes[i].turn===-1){
				nodes[i] = nodes[i].swap();
			}
		}
		
		return nodes;
    }
    
    async generateNode(N=64){
		const n = Math.max(Math.min(64, ~~N), 4);
		let node_now = new BOARD();
		
		while(true){
			if(node_now.stones===n){
                node_now.turn = 1;
				return node_now;
			}
			
			const state = node_now.state();

			if(state===1){
				const moves = await ai.cpuHand(node_now, -100, 100, 1);
				const key = Math.random()<0.05 ? ~~(Math.random()*moves.length) : 0;
				node_now = node_now.putStone(moves[key].hand1, moves[key].hand2)
			}else if(state===2){
				node_now.turn *= -1;
			}else{
				if(node_now.stones===n){
					node_now.turn = 1;
					return node_now;
				}else{
					node_now = new BOARD();
				}
			}
		}
	}
}
