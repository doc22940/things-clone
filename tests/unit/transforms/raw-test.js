import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('transform:raw', 'Unit | Transform | raw', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let transform = this.owner.lookup('transform:raw');
    assert.ok(transform);
  });
});
