import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | items-project', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`
      {{items-project
        item=(hash)
        markItemsAs=(optional)
        selectBetween=(optional)
      }}
    `);

    assert.equal(this.element.textContent.trim(), 'New Project');
  });
});
