<template lang="pug">
    .demo
        form.demo__element
            multiselect(
                v-model="selected"
                :options="options"
                :label-key="'hint'"
                :value-key="'id'"
                :input-classes="['input_square']"
                :field-label="'Список'"
                :simple-input="false"
                :empty-hint="'Пусто'"
                :hints="['вид спорта', 'вида спорта', 'видов спорта']"
                :label-hint="'виды спорта'"
            )
        pre.demo__result(v-html="visibleValue")
        input.demo__input.input.input_big.input_square(type="text" v-model.number="newValueIndex" @keypress.enter="setNewValue")
</template>

<script>
import multiselect from '../src/multiselect.vue'

export default {
    components: {
        multiselect,
    },
    data () {
        return {
            selected: [],
            options:  [],
            newValueIndex: '',
        }
    },
    created () {
        for(let i = 1; i < 201; i++) {
            let hint = (i % 3 === 0) ? `Lorem-ipsum-dolor-sit-amet-${i}` : `Hint-${i}`;

            this.options.push({id: i, hint, value: `value-${i}`});
        }
    },
    computed: {
        visibleValue () {
            return JSON.stringify(this.selected, null, '  ');
        },
    },
    methods: {
        setNewValue () {
            this.selected = [this.options[this.newValueIndex]];
            this.newValueIndex = '';
        },
    },
}
</script>

<style lang="less">
html, body {
    padding: 0;
    margin: 0;
    background-color: #f7f7f7;
    width: 100%;
    height: 100%;
    font-family: Roboto, Helvetica, Arial, sans-serif;
}
* {
    box-sizing: border-box;
}
optgroup,
select,
button,
input,
textarea {
    font-family: Roboto, Helvetica, Arial, sans-serif;
}
.demo {
    display: flex;
    width: 100%;
    padding: 30px;

    &__ {
        &element {
            flex-shrink: 0;
            min-width: 280px;
            margin-right: 50px;
        }
        &result {
            width: 300px;
            margin-right: 50px;
        }
        &input {}
    }

    @media (max-width: 991px) {
        padding: 30px 15px;
    }
}
.input {
    height: 60px;
    padding: 0 10px 0 20px;
    background: white;
    border: 1px solid #eee;
    border-radius: 4px;
    box-shadow: none;
    font-size: 16px;
    font-weight: 400;
    color: black;
    transition: 0.2s;

    &:invalid,
    &_danger {
        background-color: #fae5e8;
        border: 1px solid #d0021b;

        &:hover {
            background-color: #fae5e8;
            border: 1px solid #d0021b;
        }
    }
    &_square {
        border-radius: 0;
    }
}
</style>
