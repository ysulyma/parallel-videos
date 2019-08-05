const topFile = "/movies/A.srt";
const botFile = "/movies/B.srt";

let topDelay = 0,
		botDelay = 7600;

async function main() {
	const video = $("video");

	const topData = await (await fetch(topFile)).text();
	const botData = await (await fetch(botFile)).text();

	window.topData = topData;
	window.botData = botData;

	const topSpan = document.createElement("span"),
				botSpan = document.createElement("span");

	const topTimes = parseSRT(topData),
				botTimes = parseSRT(botData);

	document.body.appendChild(topSpan);
	document.body.appendChild(botSpan);

	let lastTime = -1,
			iTop = 0,
			iBot = 0;

	const update = () => {
		const t = video.currentTime * 1000;
		if (t < lastTime) {
			iTop = 0;
			iBot = 0;
		}
		lastTime = t;

		let found = false;
		for (let i = iTop; i < topTimes.length; ++i) {
			const {start, end, text} = topTimes[i];
			if (start <= t - topDelay && t - topDelay < end) {
				topSpan.innerHTML = text;
				found = true;
				iTop = i;
				break;
			}
		}
		if (!found) {
			topSpan.innerHTML = "";
		}

		found = false;
		for (let i = iBot; i < botTimes.length; ++i) {
			const {start, end, text} = botTimes[i];
			if (start <= t - botDelay && t - botDelay < end) {
				botSpan.innerHTML = text;
				found = true;
				iBot = i;
				break;
			}
		}
		if (!found) {
			botSpan.innerHTML = "";
		}

		requestAnimationFrame(update);
	};
	update();
}


main();

function $(selector, context = document) {
	return context.querySelector(selector);
}

function parseSRT(file) {
	return Array.from(
		file.matchAll(/^\d+$\s*([\d:,.]+) --> ([\d:,.]+)$\s*((?:.|\s+(?!^\d+$))+)/gm)
	).map(([_, start, end, text]) => {
		return {
			start: parseTime(start),
			end: parseTime(end),
			text
		};
	});
}

// parse time
function parseTime(str) {
  let [h, m, s, ms] =
    str
    .match(/^(?:(?:(\d+):)?(\d+):)?(\d+)(?:,(\d+))?$/)
    .slice(1)
    .map(x => x || "0");

  ms = ms.padEnd(3, "0");
  const [hours, minutes, seconds, milliseconds] = [h, m, s, ms].map(x => parseInt(x));
  
  return milliseconds + 1000 * (seconds + 60 * (minutes + 60 * hours));
}
