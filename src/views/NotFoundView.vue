<script setup lang="ts">
import { RouterLink } from 'vue-router'
import EmptyState from '@/components/ui/EmptyState.vue'
</script>

<template>
  <div class="container notfound">
    <EmptyState
      glyph="迷"
      title="这条路还没走过"
      description="你访问的页面不存在。回到首页，输入一个汉字继续溯源。"
    >
      <RouterLink to="/" class="btn btn--primary">回到首页</RouterLink>
    </EmptyState>
  </div>
</template>

<style scoped>
.notfound {
  padding: 80px 0;
}
</style>
