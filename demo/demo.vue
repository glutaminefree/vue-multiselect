<template lang="pug">
    .demo
        form.demo__element
            multiselect(
                v-model="selected"
                :options="options"
                :label-key="'hint'"
                :value-key="'id'"
                :input-classes="['input_big', 'input_square']"
            )
        pre.demo__result(v-html="visibleValue")
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
}
</script>

<style lang="less">
html, body {
    padding: 0;
    margin: 0;
    background-color: #f7f7f7;
    width: 100%;
    height: 100%;
}
* {
    box-sizing: border-box;
}
.demo {
    display: flex;
    width: 100%;
    padding: 30px;

    &__ {
        &element {
            margin-right: 50px;
        }
        &result {
            width: 300px;
            margin-right: 50px;
        }
        &input {}
    }
}
.input {
    height: 40px;
    padding: 0 10px 0 20px;
    background-color: white;
    border: 1px solid #eee;
    border-radius: 8px;
    box-shadow: none;
    font-size: 14px;
    font-weight: 400;
    color: black;
    transition: 0.2s;
    -webkit-appearance: none;
       -moz-appearance: none;
            appearance: none;

    /* States */
    &:hover {
        border-color: #e4dceb;
        color: #74409d;
    }
    &:disabled {
        border-color: #eee;
        background-color: #f4f4f4;
        color: #444;
        cursor: not-allowed;
    }

    &:invalid,
    &_danger {
        border: 1px solid #fcc;
        background-color: #fff9f9;

        &:hover {
            border: 1px solid #fcc;
            background-color: #fff9f9;
        }
    }
    // &:valid,
    &_success {
        border-color: #b2e6dc;
    }

    /* Visual mods */
    &_big {
        height: 60px;
        font-size: 16px;
    }
    &_small {
        height: 30px;
        padding: 0 10px;
        border-radius: 5px;
    }
    &_circled {
        border-radius: 20px;
    }
    &_square {
        border: none;
        border-radius: 0;

        &:active {
            border: none;
        }
    }

    & + .field__error.field__error_static {
        max-height: 0;
        opacity: 0;
        margin-top: 0;
        transition-property: max-height, opacity;
        transition-duration: 0.2s;
    }
    &:invalid,
    &_danger {
        & + .field__error.field__error_static {
            margin-top: 5px;
            max-height: 50px;
            opacity: 1;
        }
    }
}
</style>
