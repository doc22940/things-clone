import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | text-area', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`
      {{text-area
        class="text-area-class"
        id="text-area-id"
        value=""
        placeholder=""
        autoresize=true
        max-rows=10
        update=(optional)
        enter=(optional)
        escape-press=(optional)
      }}
    `);

    assert.equal(this.element.textContent.trim(), '');
  });
});
