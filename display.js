

class BOARD_display extends BOARD{
	constructor(node){
        super();
        Object.assign(this, node);
    }

	async render(){
		
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
		
		
		const board = this.board;
		let black = 0;
		let white = 0;
		//石の数をカウント
		for(let i=0;i<64;i++){
			if(board[i]===1){
				black++;
			}else if(board[i]===-1){
				white++;
			}
		}
		display.black_score.innerText = black;
		display.white_score.innerText = white;
		
		//石を置く
		for(let i=0;i<64;i++){
			const t = display.circles[i].classList;
			if(board[i]===1){
				t.add("black");
			}else if(board[i]===-1){
				t.add("white");
			}else{
				t.add("blank");
			}
		}
		

		if(property.mode==="setup"){
			return;
		}
		
		if(this.turn!==property.colorOfCpu){
			display.comment.innerText = 'player turn';
		}else{
			display.comment.innerText = 'cpu turn';
		}
		
		if(this.state()===3){//終局
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
	
	async showEval(alpha=-100,beta=100, depth){
		
		const search_depth = (!depth)?(property.depth_last>=64-this.stones ? -1 : property.depth):depth;
		const evals = await ai.cpuHand(this, alpha, beta, search_depth, 1, 1);

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
	
	async showMove(){
		for(const item of display.squares){
			item.classList.remove("legal");
		}

		let [move1, move2] = this.getMove();
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
        
        return;
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
        return;
	}
	
	async showHand(){
		// this.nowにhandプロパティがなかったら
		if(this.hand1===0 && this.hand2===0){
			for(let i=0;i<64;i++){
				if(display.squares[i].classList.contains("lastput")){
					display.squares[i].classList.remove("lastput");;
				}
			}
			return;
		}
		
		let x, y;
		if(this.hand1<0){
			y = 0;
			x = 0;
		}else if(this.hand1>0){
			const e = 31 - Math.log2(this.hand1);
			y = ~~(e/8);
			x = e%8;
		}
		if(this.hand2<0){
			y = 4;
			x = 0;
		}else if(this.hand2>0){
			const e = 63 - Math.log2(this.hand2);
			y = ~~(e/8);
			x = e%8;
		}
		
		//handが定義されていない場合
		if(isNaN(x*y)){
			return;
			//throw new Error("okasii yo");
		}
        display.squares[y*8+x].classList.add("lastput");
        return;
	}
}
