import DS from 'ember-data';
import { set } from '@ember/object';

const { attr, Model } = DS;

export default Model.extend({
  order: attr('number', { defaultValue: 0 }),
  name: attr('string'),
  isComplete: attr('boolean', { defaultValue: false }),
  createdAt: attr('date', {
    defaultValue() { return new Date(); }
  }),

  complete() {
    set(this, 'isComplete', true);
  },

  uncomplete() {
    set(this, 'isComplete', false);
  }
});
