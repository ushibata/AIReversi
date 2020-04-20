// 確認画面を試しに作った

const confirmWindow = (res=()=>{}, rej=()=>{}, text_="are you sure?")=>{
	const background = document.createElement("div");
	background.style.position = "absolute";
	background.style.top = "0px";
	background.style.left = "0px";
	background.style.width = "100%";
	background.style.height = "100%";
	background.style.background = "#555555";
	background.style.opacity = "0.9";

	const box = document.createElement("div");
	box.style.position = "fixed";
	box.style.top = "60px";
	box.style.left = "50%";
	box.style.transform = "translate(-50%, 0%)";
	box.style.width = "300px";
	box.style.height = "100px";
	box.style.background = "#ffffff";
	box.style.borderRadius = "10px";

	const text = document.createElement("div");
	text.innerText = text_;
	text.style.fontSize = "14px";
	text.style.margin = "15px auto";

	const yes = document.createElement("div");
	yes.style.display = "inline-block";
	yes.innerText = "OK";
	yes.style.fontSize = "14px";
	yes.style.background = "#ff6347";
	yes.style.margin = "10px auto";
	yes.style.width = "80px";
	yes.style.height = "25px";
	yes.style.lineHeight = "26px";
	yes.style.borderRadius = "6px";

	const no = document.createElement("div");
	no.style.display = "inline-block";
	no.innerText = "Cancel";
	no.style.fontSize = "14px";
	no.style.background = "#bbb";
	no.style.margin = "10px 10px";
	no.style.width = "80px";
	no.style.height = "25px";
	no.style.lineHeight = "26px";
	no.style.borderRadius = "6px";



	box.appendChild(text);
	box.appendChild(yes);
	box.appendChild(no);
	background.appendChild(box);
	document.body.appendChild(background);

	yes.addEventListener("click", ()=>{
		res();
		background.remove();
	});
	no.addEventListener("click", ()=>{
		rej();
		background.remove();
	});

}