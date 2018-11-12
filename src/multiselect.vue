<template lang="pug">
    .dropdown.multiselect(:id="randomID" :class="{'dropdown_opened': dropdownVisible}")
        .multiselect__field.dropdown__field(@click="callDropdownToggle" ref="trigger")
            slot(name="trigger")
                .dropdown__trigger
                    .simple-input(v-if="simpleInput")
                        input.input(
                            ref="valueInput"
                            v-model="inputValue"
                            :placeholder="placeholder"
                            :class="inputClasses"
                            @focus="onFocus"
                            @blur="onBlur"
                            @keydown="searchInputKeyDown"
                        )
                    .input-with-label(v-else)
                        label.input-with-label__hint(@click.prevent="labelClick") {{ fieldLabel }}
                        input.input-with-label__field.input(
                            ref="valueInput"
                            v-model="inputValue"
                            :placeholder="placeholder"
                            :class="inputClasses"
                            @focus="onFocus"
                            @blur="onBlur"
                            @keydown="searchInputKeyDown"
                        )
                    transition(name="fade")
                        .dropdown__trigger-limiter(v-if="showWordLimiter")
        .multiselect__field.multiselect__field_mobile
            .multiselect__selected(v-if="selectedOptionsList.length > 0")
                .dropdown-list
                    a.dropdown-list__item.dropdown-list__item_selected.dropdown-list__item_white(
                        v-for="option in selectedOptionsList"
                        v-html="option[labelKey]"
                        href="#"
                        @click.prevent="toggleOption(option)"
                    )
                button.multiselect__add(@click.prevent="openModalList") + {{ addMoreHint }}
            .multiselect__empty(v-else)
                input.multiselect__empty-input.input(
                    :value="emptyHint"
                    :placeholder="fieldLabel"
                    :class="inputClasses"
                    @click.prevent="openModalList"
                    readonly
                )
        transition(name="fade")
            .dropdown__items(v-if="dropdownVisible")
                .dropdown-list(ref="optionsList" :style="{maxHeight: listMaxHeight}")
                    .dropdown-list__item.dropdown-list__item_label(v-if="selectedOptionsList.length === 0") Выберите {{ labelsHint }}:
                    .dropdown-list__item.dropdown-list__item_label(v-if="selectedOptionsList.length > 0") Выбрано:
                    a.dropdown-list__item.dropdown-list__item_selected(
                        v-for="(option, index) in selectedOptionsList"
                        v-html="option[labelKey]"
                        href="#"
                        @click.prevent="toggleOption(option)"
                        :class="{'dropdown-list__item_hovered': hoveredIndex === index}"
                    )
                    .dropdown-list__item.dropdown-list__item_label(v-if="selectedOptionsList.length > 0 && unselectedOptionsList.length > 0") Другие {{ labelsHint }}:
                    a.dropdown-list__item(
                        v-for="(option, index) in unselectedOptionsList"
                        v-html="option[labelKey]"
                        href="#"
                        @click.prevent="toggleOption(option)"
                        :class="{'dropdown-list__item_hovered': (hoveredIndex === (selectedOptionsList.length + index))}"
                    )
        transition(name="fade")
            .multiselect__modal(v-if="listModalVisible" ref="modal")
                header.multiselect__modal-header
                    input.multiselect__modal-input.input(
                        ref="modalSearch"
                        v-model="modalSearchString"
                        :placeholder="fieldLabel"
                        @keydown="searchInputKeyDownMobile"
                    )
                    a.multiselect__modal-close(href="#" @click.prevent="closeModalList")
                        .the-x
                .multiselect__modal-body
                    .dropdown-list
                        a.dropdown-list__item(
                            v-for="option in unselectedOptionsList"
                            v-html="option[labelKey]"
                            href="#"
                            @click.prevent="toggleOption(option)"
                        )
</template>

<script>
import {wordForm}    from 'helpers'
import mixinDropdown from 'dropdown-mixin'

export default {
    name: 'multiselect',
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
         * Label text for input field
         */
        fieldLabel: {
            type: String,
            default: 'Выберите',
        },
        /**
         * Show only input without label
         */
        simpleInput: {
            type: Boolean,
            default: false,
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
        addMoreHint: {
            type: String,
            default: 'Добавить ещё',
        },
        labelHint: {
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
    },
    data () {
        return {
            selectedItemsIds:  [],
            listMaxHeight:     'none',
            inputValue:        '',
            modalSearchString: '',
            isFocused:         false,
            localChange:       false,
            hoveredIndex:      -1,
            listModalVisible:  false,
        };
    },
    computed: {
        labelsHint () {
            return this.labelHint.length > 0 ? this.labelHint : this.hints[1];
        },

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

        searchQuery () {
            return this.modalSearchString ?
                this.modalSearchString :
                this.isFocused ? this.inputValue : '';
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

        showWordLimiter () {
            return this.isFocused === false && this.visibleValue.length > 0;
        },
    },
    created () {
        this.setSelectedOptions();
    },
    methods: {
        onFocus () {
            this.inputValue = '';
            this.isFocused  = true;
        },
        onBlur () {
            // Wait for click by option (toggleOption) when searchQuery.length > 0
            setTimeout(() => {
                this.inputValue = this.visibleValue;
                this.isFocused  = false;
            }, 230);
        },
        labelClick () {
            this.isFocused ? this.$refs.valueInput.blur() : this.$refs.valueInput.focus();
        },

        fixPosition () {
            const header = document.querySelector('.page-header__top');

            if (header === null) {
                return false;
            }

            const headerShowHeight = 80 + parseInt(header.style.top || 0);

            this.$refs.modal.style.top    = `${headerShowHeight}px`;
            this.$refs.modal.style.height = `calc(100% - ${headerShowHeight}px)`;
        },

        openModalList () {
            this.listModalVisible = true;
            document.body.classList.add('block-scroll');
            window.addEventListener('keydown', this.mayBeHideModal, true);

            let interval = setInterval(() => {
                if (!this.$refs.modalSearch) {
                    return false;
                }

                this.fixPosition();
                this.$refs.modalSearch.focus();

                clearInterval(interval);
            })
        },
        closeModalList () {
            this.listModalVisible = false;
            this.modalSearchString = '';
            document.body.classList.remove('block-scroll');
            window.removeEventListener('keydown', this.mayBeHideModal, true);
        },
        mayBeHideModal (event) {
            if (event.key.toLowerCase() === 'escape') {
                this.closeModalList();
            }
        },

        setMaxHeight () {
            this.listMaxHeight = this.getListMaxHeight();
        },

        callDropdownToggle () {
            if (!this.dropdownVisible) {
                this.setMaxHeight();
            } else {
                this.$refs.valueInput.blur();
                this.onBlur();
            }

            this.dropdownToggle();
        },

        setSelectedOptions () {
            this.selectedItemsIds = [];

            if (this.value.length === 0) {
                this.inputValue = this.visibleValue;
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

            this.inputValue = this.visibleValue;
        },
        toggleOption (option) {
            const optionId = option[this.valueKey];

            if (this.selectedItemsIds.indexOf(optionId) === -1) {
                this.selectedItemsIds.push(optionId);
            } else {
                this.selectedItemsIds = this.selectedItemsIds.filter(id => id !== optionId);
            }

            if (this.listModalVisible) {
                this.closeModalList();
            }

            this.$nextTick(() => {
                this.$refs.valueInput.blur();
                this.onBlur();

                this.dropdownClose();

                this.localChange = true;
                this.$emit('input', this.selectedOptions);

                this.$nextTick(() => {
                    this.localChange = false;
                });
            });
        },

        searchInputKeyDown (event) {
            if (event.key.toLowerCase() === 'enter' && this.isFocused) {
                if (this.hoveredIndex !== -1) {
                    event.preventDefault();
                    this.onKeyPress(event);
                    return false;
                }

                if (this.selectedOptionsList.length > 0) {
                    this.toggleOption(this.selectedOptionsList[0]);
                    event.preventDefault();
                } else if (this.unselectedOptionsList.length > 0) {
                    this.toggleOption(this.unselectedOptionsList[0]);
                    event.preventDefault();
                }
            }
        },
        searchInputKeyDownMobile (event) {
            if (event.key.toLowerCase() === 'enter') {
                if (this.unselectedOptionsList.length > 0) {
                    this.toggleOption(this.unselectedOptionsList[0]);
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

        onKeyPress (event) {
            if (event.key.toLowerCase() === 'arrowdown') {
                if (this.hoveredIndex < (this.selectedOptionsList.length + this.unselectedOptionsList.length - 1)) {
                    this.hoveredIndex++;
                }
            }
            if (event.key.toLowerCase() === 'arrowup') {
                if (this.hoveredIndex > 0) {
                    this.hoveredIndex--;
                }
            }

            if (event.key.toLowerCase() === 'enter') {
                if (this.hoveredIndex === -1) {
                    return false;
                }

                if (this.hoveredIndex <= (this.selectedOptionsList.length - 1)) {
                    const hoveredOption = this.selectedOptionsList[this.hoveredIndex];

                    this.toggleOption(hoveredOption);
                } else if (this.hoveredIndex <= (this.selectedOptionsList.length + this.unselectedOptionsList.length - 1)) {
                    const hoveredOption = this.unselectedOptionsList[this.hoveredIndex - this.selectedOptionsList.length];

                    this.toggleOption(hoveredOption);
                }
            }
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
        dropdownVisible (visible) {
            this.hoveredIndex = -1;

            if (visible) {
                window.addEventListener('keypress', this.onKeyPress, true);
            } else {
                window.removeEventListener('keypress', this.onKeyPress, true);
            }
        },
    },
};
</script>

<style lang="less" scoped>
.multiselect {
    &__ {
        &field {
            &_mobile {
                display: none;
            }
        }
        &add {
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            -webkit-align-items: center;
            align-items: center;
            -webkit-justify-content: center;
            justify-content: center;
            width: 100%;
            height: 60px;
            background: #eee;
            border: none;
            text-decoration: none;
            font-size: 16px;
            color: black;
            cursor: pointer;
        }
        &empty {
            &-input {
                width: 100%;
            }
        }
        &modal {
            position: fixed;
            z-index: 999;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            height: 100%;
            background: white;

            &-header {
                position: relative;
                height: 60px;
            }
            &-input {
                width: 95%;
                font-size: 16px;
            }
            &-close {
                position: absolute;
                top: 20px;
                right: 20px;
                width: 24px;
                height: 24px;
            }
            &-body {
                height: ~'calc(100% - 60px)';
                overflow-y: auto;
            }
        }
    }

    @media (max-width: 991px) {
        &__ {
            &field {
                display: none;

                &_mobile {
                    display: block;
                }
            }
        }
    }
}
.dropdown {
    position: relative;

    &__ {
        &trigger {
            position: relative;

            .input {
                width: 100%;
                cursor: default;

                &:active {
                    background-color: #f3f0f5;
                    border-color: #e4dceb !important;
                    cursor: text;

                    & + .dropdown__trigger-limiter {
                        display: none;
                    }
                }
                &:focus {
                    cursor: text;

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
                z-index: 12;
                bottom: 12px;
                right: 1px;
                width: 45px;
                height: 25px;
                background-image: linear-gradient(to right, rgba(255, 255, 255, 0.5), rgb(255, 255, 255));
            }
        }
        &items {
            position: absolute;
            z-index: 20;
            width: 100%;
            margin-top: 2px;
            background-color: white;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
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
            &_white {
                background-color: white;

                &:hover {
                    background-color: white;
                }
            }
            &_hovered {
                position: relative;
                z-index: 1;
                outline: 1px dotted black;
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

    @media (max-width: 991px) {
        border: none;
    }
}
.input-with-label {
    position: relative;
    z-index: 10;
    height: 80px;
    background: white;

    &__ {
        &hint {
            position: absolute;
            z-index: 15;
            top: 10px;
            left: 20px;
            font-size: 14px;
            color: #888;
        }
        &field {
            position: relative;
            z-index: 11;
            width: 100%;
            height: 100%;
            padding-top: 30px;
            background: white;
            transition: background 0.2s;

            &:focus,
            &:active {
                background: #eee;
            }
        }
    }

    @media (max-width: 991px) {
        height: 60px;

        &__ {
            &hint {
                display: none;
            }
            &field {
                padding-top: 0;
            }
        }
    }
}
.the-x {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;

    &:before,
    &:after {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        width: 100%;
        height: 1px;
        background-color: #969696;
        transition: background-color 0.2s;
    }
    &:before {
        -webkit-transform: rotate(45deg);
                transform: rotate(45deg);
    }
    &:after {
        -webkit-transform: rotate(-45deg);
                transform: rotate(-45deg);
    }

    &:hover {
        &:before,
        &:after {
            background-color: #73429c;
        }
    }
}

// Transitions
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s;
}
.fade-enter,
.fade-leave-to {
    opacity: 0;
}
</style>
