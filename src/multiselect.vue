<template lang="pug">
    .dropdown(:id="randomID" :class="{'dropdown_opened': dropdownVisible}")
        .dropdown__field(@click="callDropdownToggle" ref="trigger")
            slot(name="trigger")
                .dropdown__trigger(:class="{'dropdown__trigger_with-arrow': triggerArrow}")
                    input.input(
                        v-if="!isFocused"
                        ref="valueInput"
                        v-model="visibleValue"
                        :placeholder="placeholder"
                        :class="inputClasses"
                        readonly
                        @focus="onFocus"
                    )
                    input.input(
                        v-if="isFocused"
                        ref="searchInput"
                        v-model="searchQuery"
                        @blur="onBlur"
                        @keydown="searchInputKeyDown"
                        :class="inputClasses"
                    )
                    .dropdown__trigger-limiter
        transition(name="fadeIn")
            .dropdown__items(v-if="dropdownVisible" :class="{'dropdown__items_with-arrow': listArrow}" @click.stop="")
                .dropdown-list(:style="{maxHeight: listMaxHeight}")
                    .dropdown-list__item.dropdown-list__item_label(v-if="selectedOptionsList.length === 0") Выберите {{ hints[1] }}:
                    .dropdown-list__item.dropdown-list__item_label(v-if="selectedOptionsList.length > 0") Выбрано:
                    a.dropdown-list__item(
                        v-for="option in selectedOptionsList"
                        v-html="option[labelKey]"
                        :class="{'dropdown-list__item_selected': selectedItemsIds.indexOf(option[valueKey]) !== -1}"
                        href="#"
                        @click.prevent="toggleOption(option)"
                    )
                    .dropdown-list__item.dropdown-list__item_label(v-if="selectedOptionsList.length > 0 && unselectedOptionsList.length > 0") Другие {{ hints[1] }}:
                    a.dropdown-list__item(
                        v-for="option in unselectedOptionsList"
                        v-html="option[labelKey]"
                        :class="{'dropdown-list__item_selected': selectedItemsIds.indexOf(option[valueKey]) !== -1}"
                        href="#"
                        @click.prevent="toggleOption(option)"
                    )
</template>

<script>
import {wordForm}    from 'helpers'
import mixinDropdown from 'dropdown-mixin'

export default {
    name: 'dropdown-list',
    mixins: [mixinDropdown],
    props: {
        /**
         * List of options for dropdown list
         */
        options: {
            type: Array,
            default () {
                return [];
            },
        },
        /**
         * Selected values
         */
        value: {
            type: Array,
            default () {
                return [];
            },
        },

        /**
         * Field inside each option
         * for using as hint
         */
        labelKey: {
            type: String,
            required: true,
        },
        valueKey: {
            type: String,
            required: true,
        },
        /**
         * Max selected options
         */
        maxSelected: {
            type: Number,
            default: 5,
        },
        /**
         * Placeholder for input field
         */
        placeholder: {
            type: String,
            default: 'Поиск',
        },
        hints: {
            type: Array,
            default () {
                return ['значение', 'значения', 'значений'];
            },
        },
        emptyHint: {
            type: String,
            default: '',
        },

        /**
         * Class list for input tag
         */
        inputClasses: {
            type: Array,
            default () {
                return [];
            },
        },
        triggerArrow: {
            type: Boolean,
            default: false
        },
        listArrow: {
            type: Boolean,
            default: false
        },
    },
    data () {
        return {
            selectedItemsIds: [],
            listMaxHeight:    'none',

            searchQuery: '',
            isFocused:   false,
            localChange: false,
        };
    },
    computed: {
        visibleValue () {
            if (this.selectedOptions.length === 0) {
                return this.emptyHint.length > 0 ? this.emptyHint : '';
            }
            if (this.selectedOptions.length === 1) {
                return this.selectedOptions[0][this.labelKey];
            }
            if (this.selectedOptions.length > 1) {
                return wordForm(this.selectedOptions.length, this.hints, true);
            }
        },

        selectedOptions () {
            return this.options.filter(option => {
                let optionId = option[this.valueKey];

                return this.selectedItemsIds.indexOf(optionId) !== -1;
            });
        },
        unselectedOptions () {
            return this.options.filter(option => {
                let optionId = option[this.valueKey];

                return this.selectedItemsIds.indexOf(optionId) === -1;
            });
        },
        selectedOptionsList () {
            return this.searchQuery.length === 0 ? this.selectedOptions : this.filterBySearchQuery(this.selectedOptions);
        },
        unselectedOptionsList () {
            return this.searchQuery.length === 0 ? this.unselectedOptions : this.filterBySearchQuery(this.unselectedOptions);
        },
    },
    created () {
        this.setSelectedOptions();
    },
    methods: {
        onFocus () {
            this.isFocused = true;
            this.setMaxHeight();
            this.dropdownOpen();

            this.$nextTick(() => {
                this.$refs.searchInput.focus();
                this.$el.click();
            });
        },
        onBlur () {
            this.isFocused = false;
        },

        setMaxHeight () {
            this.listMaxHeight = this.getListMaxHeight();
        },

        callDropdownToggle () {
            if (!this.dropdownVisible) {
                this.setMaxHeight();
            } else {
                this.onBlur();
            }

            this.dropdownToggle();
        },

        setSelectedOptions () {
            this.selectedItemsIds = [];

            if (this.value.length === 0) {
                return true;
            }

            this.options.forEach(option => {
                this.value.some(valueItem => {
                    if (option[this.valueKey] === valueItem[this.valueKey]) {
                        this.selectedItemsIds.push(valueItem[this.valueKey]);
                        return true;
                    }
                })
            });
        },
        toggleOption (option) {
            if (this.$refs.valueInput) {
                this.$refs.valueInput.blur();
            }
            this.searchQuery = '';
            this.onBlur();

            let optionId = option[this.valueKey];

            if (this.selectedItemsIds.indexOf(optionId) === -1) {
                this.selectedItemsIds.push(optionId);
            } else {
                this.selectedItemsIds = this.selectedItemsIds.filter(id => id !== optionId);
            }

            this.dropdownClose();

            this.$nextTick(() => {
                this.localChange = true;
                this.$emit('input', this.selectedOptions);

                this.$nextTick(() => {
                    this.localChange = false;
                });
            });
        },

        searchInputKeyDown (event) {
            if (event.key.toLowerCase() === 'enter') {
                if (this.optionsList.length > 0) {
                    this.toggleOption(this.optionsList[0]);
                    event.preventDefault();
                }
            }
        },

        filterBySearchQuery (options) {
            const searchString = this.searchQuery.toLowerCase();

            return options.filter(option => {
                const optionString = option[this.labelKey].toLowerCase();

                return optionString.search(searchString) !== -1;
            });
        },
    },
    watch: {
        value (newValue) {
            if (this.localChange) {
                return true;
            }

            this.setSelectedOptions();
        },
        options (newOptions) {
            this.setSelectedOptions();
        },
    },
};
</script>

<style lang="less" scoped>
.dropdown {
    position: relative;

    &__ {
        &trigger {
            position: relative;

            .input {
                width: 100%;
                cursor: pointer;

                &:active {
                    background-color: #f3f0f5;
                    border-color: #e4dceb !important;

                    & + .dropdown__trigger-limiter {
                        display: none;
                    }
                }
                &:focus {
                    & + .dropdown__trigger-limiter {
                        display: none;
                    }
                }

                &.bg_white {
                    background-color: white !important;
                }
            }

            &-limiter {
                position: absolute;
                top: ~'calc(50% - 12.5px)';
                right: 1px;
                width: 45px;
                height: 25px;
                background-image: linear-gradient(to right, rgba(255, 255, 255, 0.5), rgb(255, 255, 255));
            }

            &_with-arrow {
                &:after {
                    position: absolute;
                    top: ~'calc(50% - 2px)';
                    right: 17px;
                    content: '';
                    border-style: solid;
                    border-width: 5px 5px 0 5px;
                    border-color: #adadad transparent transparent transparent;
                    color: #adadad;
                    transition: transform 0.4s;
                }

                input {
                    padding-right: 40px;
                }
            }
        }
        &items {
            position: absolute;
            z-index: 20;
            width: 100%;
            margin-top: 2px;
            background-color: white;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);

            &_with-arrow {
                &:after,
                &:before {
                    position: absolute;
                    content: '';
                    width: 0;
                    height: 0;
                    border-style: solid;
                }
                &:before {
                    top: -7px;
                    left: ~'calc(50% - 3px)';
                    border-width: 0 6px 6px 6px;
                    border-color: transparent transparent #e5e5e5 transparent;
                }
                &:after {
                    top: -5px;
                    left: ~'calc(50% - 2px)';
                    display: inline-block;
                    border-width: 0 5px 5px 5px;
                    border-color: transparent transparent white transparent;
                }
            }
        }
    }

    &_opened {
        .dropdown__ {
            &trigger_with-arrow {
                &:after {
                    -webkit-transform: rotate(180deg);
                            transform: rotate(180deg);
                }
            }
        }
    }
}
.dropdown-list {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-flex-direction: column;
    flex-direction: column;
    overflow: auto;

    &__ {
        &item {
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            -webkit-align-items: center;
            align-items: center;
            -webkit-flex-shrink: 0;
            flex-shrink: 0;
            min-height: 60px;
            padding: 20px;
            background-color: white;
            text-decoration: none;
            font-size: 16px;
            color: black;

            &_selected,
            &:hover {
                background-color: #eee;
            }

            &_label {
                color: #888;

                &:hover {
                    background-color: white;
                }
            }
            &_selected {
                &:after {
                    content: '';
                    flex-shrink: 0;
                    width: 16px;
                    height: 16px;
                    margin-left: auto;
                    background: url('./icon--close.svg') no-repeat;
                }
            }
        }
    }
}
</style>
