import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, triggerEvent, triggerKeyEvent, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { spy } from 'sinon';
import { setupFactoryGuy, make } from 'ember-data-factory-guy';
import { shouldBeEditing, shouldNotBeEditing } from 'things/tests/helpers/editing-mode';

function renderComponent() {
  return render(hbs`
    {{task-item
      task=task
      saveTask=saveTask
      completeItems=completeItems
      uncompleteItems=uncompleteItems
      selectBetween=selectBetween
      data-test-task=true
    }}
  `);
}

module('Integration | Component | task-item', function(hooks) {
  setupRenderingTest(hooks);
  setupFactoryGuy(hooks);

  hooks.beforeEach(function() {
    this.task = make('task');
    this.set('task', this.task);
    this.set('saveTask', () => null);
    this.set('completeItems', () => null);
    this.set('uncompleteItems', () => null);
    this.set('selectBetween', () => null);
  });

  test('it renders task name', async function(assert) {
    let taskName = 'new task';
    this.task.set('name', taskName);
    await renderComponent();
    assert.dom('[data-test-task-name]').hasText(taskName);
  });

  test('it renders placeholder when name is empty', async function(assert) {
    let placeholder = 'New To-Do';
    this.task.set('name', '');
    await renderComponent();
    assert.dom('[data-test-task-name]').hasText(placeholder);
  });

  test('it sets correct checkbox and label id', async function(assert) {
    let checkboxId = 'task-checkbox-1';
    await renderComponent();
    assert.dom('[data-test-task-checkbox]').hasAttribute('id', checkboxId);
    assert.dom('[data-test-task-checkbox-label]').hasAttribute('for', checkboxId);
  });

  test('it links checkbox label to checkbox', async function(assert) {
    await renderComponent();
    assert.dom('[data-test-task-checkbox]').isNotChecked();

    await click('[data-test-task-checkbox-label]');
    assert.dom('[data-test-task-checkbox]').isChecked();

    await click('[data-test-task-checkbox-label]');
    assert.dom('[data-test-task-checkbox]').isNotChecked();
  });

  test('it renders complete task properly', async function(assert) {
    this.task.set('isCompleted', true);
    await renderComponent();
    assert.dom('[data-test-task-checkbox]').isChecked();
    assert.dom('[data-test-task]').hasClass('is-completed');
  });

  test('it renders incomplete task properly', async function(assert) {
    this.task.set('isCompleted', false);
    await renderComponent();
    assert.dom('[data-test-task-checkbox]').isNotChecked();
    assert.dom('[data-test-task]').hasNoClass('is-completed');
  });

  test('it is selected after click', async function(assert) {
    let itemSelector = this.owner.lookup('service:task-selector');
    await renderComponent();
    assert.notOk(itemSelector.isSelected(this.task), 'task is not selected before click');

    await click('[data-test-task]');
    assert.ok(itemSelector.isSelected(this.task), 'task is selected after click');
  });

  test('it deselect other tasks on click', async function(assert) {
    let itemSelector = this.owner.lookup('service:task-selector');
    let otherTask = {};

    await renderComponent();
    itemSelector.select(otherTask);
    assert.ok(itemSelector.isSelected(otherTask), 'before click other task is selected');
    assert.notOk(itemSelector.isSelected(this.task), 'before click target task is not selected');

    await triggerEvent('[data-test-task]', 'mousedown');
    assert.notOk(
      itemSelector.isSelected(otherTask),
      'after click other task is not selected anymore'
    );
    assert.ok(itemSelector.isSelected(this.task), 'after click target task is selected');
  });

  test('it selects target task and does not deselect other tasks on click with metaKey', async function(assert) {
    let itemSelector = this.owner.lookup('service:task-selector');
    let otherTask = {};

    await renderComponent();
    itemSelector.select(otherTask);
    assert.ok(itemSelector.isSelected(otherTask), 'before click other task is selected');
    assert.notOk(itemSelector.isSelected(this.task), 'before click target task is not selected');

    await triggerEvent('[data-test-task]', 'mousedown', { metaKey: true });
    assert.ok(itemSelector.isSelected(otherTask), 'after click other task is still selected');
    assert.ok(itemSelector.isSelected(this.task), 'after click target task is selected too');
  });

  test('it deselects selected target task on click with metaKey', async function(assert) {
    let itemSelector = this.owner.lookup('service:task-selector');
    itemSelector.select(this.task);
    await renderComponent();
    assert.ok(itemSelector.isSelected(this.task), 'before click target task is selected');

    await triggerEvent('[data-test-task]', 'mousedown', { metaKey: true });
    assert.notOk(itemSelector.isSelected(this.task), 'after click target task is deselected');
  });

  test('it does not deselect selected target task on click without metaKey', async function(assert) {
    let itemSelector = this.owner.lookup('service:task-selector');
    itemSelector.select(this.task);
    await renderComponent();
    assert.ok(itemSelector.isSelected(this.task), 'before click target task is selected');

    await triggerEvent('[data-test-task]', 'mousedown');
    assert.ok(itemSelector.isSelected(this.task), 'after click target task is still selected');
  });

  test('it calls selectBetween action on click with shiftKey', async function(assert) {
    this.owner.lookup('service:task-selector').select({});
    let selectBetween = spy();
    this.set('selectBetween', selectBetween);
    await renderComponent();
    await triggerEvent('[data-test-task]', 'mousedown', { shiftKey: true });
    assert.ok(
      selectBetween.calledOnceWith(this.task),
      'after click selectBetween action is called'
    );
  });

  test('it does not call selectBetween action on click without shiftKey', async function(assert) {
    this.owner.lookup('service:task-selector').select({});
    let selectBetween = spy();
    this.set('selectBetween', selectBetween);
    await renderComponent();
    await triggerEvent('[data-test-task]', 'mousedown');
    assert.ok(selectBetween.notCalled, 'after click selectBetween action is not called');
  });

  test('it ignores shiftKey when click without previous selection', async function(assert) {
    let selectBetween = spy();
    this.set('selectBetween', selectBetween);
    await renderComponent();
    await triggerEvent('[data-test-task]', 'mousedown', { shiftKey: true });
    assert.ok(selectBetween.notCalled, 'after click selectBetween action is not called');
  });

  test('it is not selected on checkbox or label click', async function(assert) {
    let itemSelector = this.owner.lookup('service:task-selector');
    await renderComponent();
    await click('[data-test-task-checkbox]');
    assert.notOk(itemSelector.isSelected(this.task), 'task is not selected');

    await click('[data-test-task-checkbox-label]');
    assert.notOk(itemSelector.isSelected(this.task), 'task is not selected');
  });

  test('it calls completeItems action on checkbox click', async function(assert) {
    let completeItems = spy();
    this.set('completeItems', completeItems);
    this.task.set('isCompleted', false);
    await renderComponent();
    await click('[data-test-task-checkbox]');
    await new Promise(resolve => setTimeout(() => resolve(), 100));
    assert.ok(completeItems.calledOnceWith(this.task));
  });

  test('it calls uncompleteItems action on checkbox click', async function(assert) {
    let uncompleteItems = spy();
    this.set('uncompleteItems', uncompleteItems);
    this.task.set('isCompleted', true);
    await renderComponent();
    await click('[data-test-task-checkbox]');
    assert.ok(uncompleteItems.calledOnceWith(this.task));
  });

  test('it is not editing by default', async function(assert) {
    await renderComponent();
    shouldNotBeEditing('[data-test-task]', assert);
  });

  test('it renders editing mode properly', async function(assert) {
    let taskName = 'new task';
    this.task.set('name', taskName);
    this.owner.lookup('service:task-editor').edit(this.task);
    await settled();
    await renderComponent();

    shouldBeEditing('[data-test-task]', assert);
    assert.dom('[data-test-task-name-input]').hasValue(taskName);
  });

  test('it starts editing on double click', async function(assert) {
    await renderComponent();
    shouldNotBeEditing('[data-test-task]', assert);

    await triggerEvent('[data-test-task]', 'dblclick');
    shouldBeEditing('[data-test-task]', assert);
  });

  test('it stops editing on Enter', async function(assert) {
    this.owner.lookup('service:task-editor').edit(this.task);
    await settled();
    await renderComponent();
    shouldBeEditing('[data-test-task]', assert);

    await triggerKeyEvent('[data-test-task-name-input]', 'keyup', 'Enter');
    shouldNotBeEditing('[data-test-task]', assert);
  });

  test('it stops editing on Escape', async function(assert) {
    this.owner.lookup('service:task-editor').edit(this.task);
    await settled();
    await renderComponent();
    shouldBeEditing('[data-test-task]', assert);

    await triggerKeyEvent('[data-test-task-name-input]', 'keyup', 'Escape');
    shouldNotBeEditing('[data-test-task]', assert);
  });

  test('it stops editing on side click', async function(assert) {
    this.owner.lookup('service:task-editor').edit(this.task);
    await settled();
    await renderComponent();
    shouldBeEditing('[data-test-task]', assert);

    await click(document.body);
    shouldNotBeEditing('[data-test-task]', assert);
  });
});
