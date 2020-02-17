describe('Test position/offset helpers', function() {
	let box,
		mainBox = getBox(),
		iframe = document.createElement('iframe');
	iframe.setAttribute(
		'style',
		'position: absolute; left: 0; top: 0; border: 0; width: 2000px; height: 3000px; background: purple; z-index: 1000000;'
	);
	let mainDoc;

	beforeEach(function() {
		mainBox.appendChild(iframe);
		mainDoc = iframe.contentWindow.document;

		const lines = [];

		Jodit.modules.Helpers.$$('style, link', document).forEach(function(
			elm
		) {
			const t = elm.tagName.toLowerCase();

			let content;

			if (t === 'link') {
				content = Array.from(elm.sheet.cssRules)
					.map(function(f) {
						return f.cssText;
					})
					.join('\n');
			} else {
				content = elm.innerHTML;
			}

			lines.push('<style>' + content + '</style>');
		});

		mainDoc.open();
		mainDoc.write(
			'<html><head>' +
				lines.join('') +
				'<style>textarea {display: none}strong {height:18px;display:block}</style></head><body><div></div><textarea></textarea></body></html>'
		);
		mainDoc.close();
	});

	function makeBox(doc) {
		doc = doc || mainDoc;
		const win = doc.defaultView;

		box = doc.createElement('div');
		box.id = 'uniq';
		box.setAttribute(
			'style',
			'height: 2000px; width: 100%;border: 20px solid red; padding: 20px; margin: 20px;'
		);

		const style = doc.createElement('style');
		style.innerHTML =
			'html, body {height: 5000px; width: 5000px;} #uniq, #uniq strong, #uniq div {line-height:18px;font-family: Arial;box-sizing:content-box; } #uniq strong {height:18px;display:block}';
		box.appendChild(style);

		doc.body.appendChild(box);
		win.scrollTo(0, box.offsetTop);

		const div = doc.createElement('div');

		for (let i = 0; i < 30; i += 1) {
			const s = doc.createElement('strong');
			// s.textContent = i;
			div.appendChild(s);
		}

		box.appendChild(div);
		div.setAttribute(
			'style',
			'position: relative; height: 300px; width: 100%;border: 20px solid red; padding: 20px 0 0 20px; margin: 20px 0 0 20px; overflow: hidden;'
		);

		const div2 = doc.createElement('div');
		div.appendChild(div2);
		div2.setAttribute(
			'style',
			'position: relative; min-height: 200px; width: 100%;border: 10px solid yellow; padding: 20px 0 0 20px; margin: 20px 0 0 20px;'
		);

		const div3 = doc.createElement('div');
		div2.appendChild(div3);
		div3.setAttribute(
			'style',
			'position: relative; min-height: 200px; width: 100%;border: 10px solid green; padding: 20px 0 0 20px; margin: 20px 0 0 20px;'
		);

		const div6 = doc.createElement('div');
		div3.appendChild(doc.createElement('strong'));
		div3.appendChild(doc.createElement('strong'));
		div3.appendChild(doc.createElement('strong'));
		div3.appendChild(div6);
		div6.setAttribute(
			'style',
			'width: 100%;border: 10px solid blue; padding: 20px 0 0 20px; margin: 20px 0 0 20px;'
		);
		div6.innerHTML = 'hi';

		div.scrollTo(0, 100000);

		return div6;
	}

	function fillBox(count, box) {
		for (let i = 0; i < count; i += 1) {
			const br = mainDoc.createElement('strong');
			box.appendChild(br);
		}
	}

	describe('Test position helper', function() {
		it('Should calculate correct screen position of element', function() {
			const span = makeBox();

			const pos = Jodit.modules.Helpers.position(span);

			createPoint(pos.left, pos.top, '#cdf', true);

			if (pos.top !== 261) {
				console.log(pos);
				console.log(JSON.stringify(window.outerWidth));
				console.log(JSON.stringify(window.screen.width));
				console.log(JSON.stringify(window.screen.height));
				console.log(JSON.stringify(span.getBoundingClientRect()));
				console.log(JSON.stringify(span.getClientRects()));
				console.log(JSON.stringify(span.getClientRects()));

				let xPos = 0,
					yPos = 0,
					el = span;

				const doc = mainDoc;

				while (el) {
					if (el.tagName == 'BODY') {
						// deal with browser quirks with body/window/document and page scroll
						const xScroll = el.scrollLeft || doc.documentElement.scrollLeft,
							yScroll = el.scrollTop || doc.documentElement.scrollTop;

						xPos += el.offsetLeft - xScroll + el.clientLeft;
						yPos += el.offsetTop - yScroll + el.clientTop;

						console.log('s', xPos, yPos);
					} else {
						// for all other non-BODY elements
						xPos += el.offsetLeft - el.scrollLeft + el.clientLeft;
						yPos += el.offsetTop - el.scrollTop + el.clientTop;
						console.log('f', xPos, yPos, el.outerHTML.replace(/^(<[^>]+>)(.*)/, '$1'));
						console.log('fx', el.offsetLeft, el.scrollLeft, el.clientLeft);
						console.log('fy', el.offsetTop, el.scrollTop, el.clientTop);
					}

					el = el.offsetParent;
				}
			}

			expect(pos.top).equals(264);
			expect(pos.left).equals(250);
		});

		describe('In the out of the screen', function() {
			it('Should show negative screen coordinates', function() {
				const span = makeBox();

				iframe.contentWindow.scrollTo(0, box.offsetTop + 1500);
				const pos = Jodit.modules.Helpers.position(span);

				expect(pos.top).equals(-1236);
				expect(pos.left).equals(250);
				createPoint(pos.left, pos.top, '#cdf', true);
			});
		});

		describe('In iframe', function() {
			it('Should calculate correct screen position of element', function() {
				fillBox(100, mainDoc.querySelector('div'));

				const jodit = Jodit.make('textarea', {
					ownerWindow: iframe.contentWindow,
					ownerDocument: mainDoc,
					iframe: true,
					height: 10000
				});

				const span = makeBox(jodit.editorDocument);

				jodit.ownerWindow.scrollTo(0, jodit.container.offsetTop - 100);

				const pos = Jodit.modules.Helpers.position(span, jodit);

				createPoint(pos.left, pos.top, '#cdf', true);

				expect(pos.top).equals(461);
				expect(pos.left).equals(261);
			});
		});
	});

	describe('Test offset helper', function() {
		it('Should calculate correct absolute position of element from top of document', function() {
			const span = makeBox(),
				jodit = Jodit.make('textarea', {
					ownerWindow: iframe.contentWindow,
					ownerDocument: mainDoc
				});

			jodit.editor.appendChild(box);
			box.firstChild.scrollTo(0, 100000);

			iframe.contentWindow.scrollTo(0, jodit.container.offsetTop);
			jodit.editor.scrollTo(0, span.offsetTop);

			const pos = Jodit.modules.Helpers.offset(
				span,
				jodit,
				jodit.editorDocument
			);

			createPoint(pos.left, pos.top, '#cdf');

			expect(
				pos.top - box.offsetTop - iframe.contentWindow.scrollY
			).equals(881);
			expect(pos.left).equals(251);
		});

		describe('In iframe', function() {
			it('Should calculate correct absolute position of element from top of document', function() {
				const jodit = Jodit.make('textarea', {
					ownerWindow: iframe.contentWindow,
					ownerDocument: mainDoc,
					iframe: true,
					height: 10000
				});

				span = makeBox(jodit.editorDocument);
				box.firstChild.scrollTo(0, 100000);

				iframe.contentWindow.scrollTo(0, jodit.container.offsetTop);
				jodit.editor.scrollTo(0, span.offsetTop);

				const pos = Jodit.modules.Helpers.offset(
					span,
					jodit,
					jodit.editorDocument
				);

				expect(
					pos.top -
						box.offsetTop -
						jodit.ownerWindow.scrollY -
						jodit.editorWindow.scrollY
				).equals(321);
				expect(pos.left).equals(251);

				createPoint(pos.left, pos.top, '#cdf');
			});
		});
	});

	afterEach(function() {
		Jodit.modules.Dom.safeRemove(box);
		Jodit.modules.Dom.safeRemove(iframe);
	});
});
