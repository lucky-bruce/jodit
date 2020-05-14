describe('Undo/Redo behaviors', function() {
	describe('Do some changes', function() {
		it('Should change redo/undo stack', function() {
			const editor = getJodit({
				observer: {
					timeout: 0
				}
			});

			editor.value = 'test';

			const range = editor.selection.createRange();
			range.setEnd(editor.editor.firstChild, 4);
			range.collapse(false);
			editor.selection.selectRange(range);

			clickTrigger('paragraph', editor);

			const list = getOpenedPopup(editor);

			clickButton('h1', list);


			expect(editor.value).equals('<h1>test</h1>');

			editor.execCommand('undo');

			expect(editor.value).equals('test');

			editor.execCommand('redo');

			expect(editor.value).equals('<h1>test</h1>');
		});

		describe('Several operations', function() {
			it('Should work perfect', function() {
				const editor = getJodit();
				editor.value =
					'<p>test</p>' +
					'<ul>' +
					'<li>test2</li>' +
					'<li>test3</li>' +
					'<li><a>test4</a></li>' +
					'</ul>';

				const range = editor.selection.createRange();
				range.setStart(editor.editor.firstChild.firstChild, 1);
				range.setEnd(editor.editor.lastChild.firstChild, 1);
				editor.selection.selectRange(range);

				simulateEvent('keydown', Jodit.KEY_BACKSPACE, editor.editor);

				expect(editor.value).equals(
					'<p>t</p><ul><li>test3</li><li><a>test4</a></li></ul>'
				);

				editor.execCommand('undo');

				expect(editor.value).equals(
					'<p>test</p><ul><li>test2</li><li>test3</li><li><a>test4</a></li></ul>'
				);

				range.setStart(editor.editor.firstChild.firstChild, 0);
				range.setEnd(editor.editor.firstChild.firstChild, 3);
				editor.selection.selectRange(range);

				simulateEvent('keydown', Jodit.KEY_BACKSPACE, editor.editor);

				expect(editor.value).equals(
					'<p>t</p><ul><li>test2</li><li>test3</li><li><a>test4</a></li></ul>'
				);

				editor.execCommand('undo');

				expect(editor.value).equals(
					'<p>test</p><ul><li>test2</li><li>test3</li><li><a>test4</a></li></ul>'
				);
			});
		});
	});

	describe('Commands', function() {
		it('Undo. Enter text wait and again enter text. After execute "undo" command. First text should be returned', function() {
			const editor = getJodit({
				observer: {
					timeout: 0 // disable delay
				}
			});

			editor.value = 'test';
			editor.value = 'test2';
			editor.execCommand('undo');
			expect(editor.value).equals('test');
		});
		it('Redo. Enter text wait and again enter text. After execute "undo" + "redo" command in editor should be second text', function() {
			const editor = getJodit({
				observer: {
					timeout: 0
				}
			});

			editor.value = 'test';
			editor.value = 'test2';
			editor.execCommand('undo');
			expect(editor.value).equals('test');
			editor.execCommand('redo');
			expect(editor.value).equals('test2');
		});
		it('Check react UndoRedo to another changes', function() {
			const editor = getJodit({
				observer: {
					timeout: 0
				}
			});

			editor.value = 'test';

			const range = editor.selection.createRange();
			range.setEnd(editor.editor.firstChild, 4);
			range.collapse(false);
			editor.selection.sel.removeAllRanges();
			editor.selection.sel.addRange(range);

			editor.selection.insertNode(
				editor.createInside.text('test2')
			);
			editor.execCommand('undo');
			expect(editor.value).equals('test');

			editor.execCommand('redo');
			expect(editor.value).equals('testtest2');
		});
	});

	describe('Clear stack', function() {
		it('Should disable both buttons in toolbar and all calls redo and undo must do nothing', function() {
			const editor = getJodit({
				toolbarAdaptive: false,
				observer: {
					timeout: 0
				}
			});

			const undo = getButton('undo', editor);
			expect(undo).is.not.null;
			const redo = getButton('redo', editor);
			expect(redo).is.not.null;

			expect(undo.hasAttribute('disabled')).is.true;
			expect(redo.hasAttribute('disabled')).is.true;

			editor.value = 'test';
			editor.value = 'stop';

			expect(undo.hasAttribute('disabled')).is.false;
			expect(redo.hasAttribute('disabled')).is.true;

			simulateEvent('click', 0, undo);
			expect(editor.value).equals('test');
			expect(undo.hasAttribute('disabled')).is.false;
			expect(redo.hasAttribute('disabled')).is.false;

			simulateEvent('click', 0, redo);
			expect(editor.value).equals('stop');
			expect(undo.hasAttribute('disabled')).is.false;
			expect(redo.hasAttribute('disabled')).is.true;

			editor.observer.clear();

			expect(undo.hasAttribute('disabled')).is.true;
			expect(redo.hasAttribute('disabled')).is.true;
			expect(editor.value).equals('stop');

			editor.execCommand('undo');
			expect(undo.hasAttribute('disabled')).is.true;
			expect(redo.hasAttribute('disabled')).is.true;
			expect(editor.value).equals('stop');
		});
	});

	afterEach(removeStuff);
});
