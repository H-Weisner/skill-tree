<template>
  <div
    class="mt-8 flex relative lg:mt-0 lg:py-1 lg:pb-4 lg:pl-[calc(var(--section-gap)/2)] before:content-[''] before:border-l before:border-(--color-border) before:absolute before:left-0 before:bottom-[calc(50%+25px)] before:h-[calc(50%-25px)] before:hidden lg:before:block first-of-type:before:hidden after:content-[''] after:border-l after:border-(--color-border) after:absolute after:left-0 after:top-[calc(50%+25px)] after:h-[calc(50%-25px)] after:hidden lg:after:block last-of-type:after:hidden"
  >
    <i
      class="flex place-items-center place-content-center w-8 h-8 text-(--color-text) lg:absolute lg:top-[calc(50%-25px)] lg:-left-[26px] lg:border lg:border-(--color-border) lg:bg-(--color-background) lg:rounded-lg lg:w-[50px] lg:h-[50px]"
    >
      <slot name="icon"></slot>
    </i>
    <div class="flex-1 ml-4">
      <h3 class="text-xl font-medium mb-1.5 text-(--color-heading)">
        <slot name="heading"></slot>
      </h3>
      <slot></slot>
    </div>
  </div>
</template>
