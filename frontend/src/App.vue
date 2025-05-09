<template>
  <el-container class="min-h-screen bg-gradient-to-b from-blue-100 to-white py-10">
    <!-- 侧边栏 -->
    <el-aside width="420px" class="px-8">
      <!-- 查询输入框 -->
      <el-form @submit.prevent="onQuery" class="mb-4">
        <el-row :gutter="8">
          <el-col :span="16">
            <el-input v-model="pid" ref="inputRef" placeholder="请输入题号，如 P1000" @keyup.enter.native="onQuery"
              @focus="selectAll" clearable />
          </el-col>
          <el-col :span="8">
            <el-button type="primary" @click="onQuery" style="width:100%">查询</el-button>
          </el-col>
        </el-row>
      </el-form>
      <!-- 用户选择器 -->
      <el-card shadow="hover" class="mb-4" style="padding-bottom: 12px; max-width: 600px; margin: 0 auto;">
        <div class="font-bold text-blue-700 mb-2">用户选择器</div>
        <div style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: flex-start;">
          <div v-for="user in allUsers" :key="user.uid"
            :style="`flex: 0 0 ${cardWidth}px; max-width: ${cardWidth}px; min-width: 80px; margin-bottom: 8px;`">
            <el-card
              :body-style="{ padding: '12px 4px', textAlign: 'center', cursor: 'pointer', minHeight: '90px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }"
              :class="selectedUids.has(user.uid) ? 'border-blue-500' : ''" @click="toggleUser(user.uid)" shadow="never">
              <el-avatar :src="user.avatar" size="large" class="mb-2" />
              <div class="font-semibold text-blue-700"
                :style="`word-break: break-all; max-width: ${cardWidth - 24}px; white-space: normal; overflow-wrap: break-word;`">
                {{ user.nickname }}</div>
              <div v-if="showRealname && user.name" class="text-gray-500 text-xs mt-1"
                :style="`max-width: ${cardWidth - 24}px; word-break: break-all; white-space: normal; overflow-wrap: break-word;`">
                {{ user.name }}</div>
              <el-tag v-if="selectedUids.has(user.uid)" type="success" size="small" class="mt-1">已选中</el-tag>
            </el-card>
          </div>
        </div>
        <el-row class="mt-4" :gutter="8">
          <el-col :span="12">
            <el-button type="warning" @click="reverseSelect" style="width:100%">反向选择</el-button>
          </el-col>
          <el-col :span="12">
            <el-button @click="refreshUsers" style="width:100%">更新用户信息</el-button>
          </el-col>
        </el-row>
      </el-card>
      <!-- 显示姓名开关 -->
      <el-switch v-model="showRealname" active-text="显示真实姓名" inactive-text="隐藏真实姓名" class="mt-2" />
    </el-aside>
    <!-- 主内容 -->
    <el-main>
      <el-card class="mx-auto mt-2" :style="{
        maxWidth: '900px',
        boxShadow: users.length === 0 && !loading && !error ? '0 0 24px 4px #22c55e88' : (users.length > 0 ? '0 0 24px 4px #ef444488' : '0 0 0 0 transparent'),
        border: '2px solid ' + (users.length === 0 && !loading && !error ? '#22c55e' : (users.length > 0 ? '#ef4444' : '#e5e7eb')),
        background: '#fff',
        minHeight: '320px',
      }" shadow="hover">
        <div class="mb-4 text-lg font-semibold text-center">
          <template v-if="loading">查询中...</template>
          <template v-else-if="error"><span class="text-red-500">{{ error }}</span></template>
          <template v-else-if="users.length === 0">未查询到AC记录，本题可用！</template>
          <template v-else>如下用户做过此题，请谨慎选用</template>
        </div>
        <el-row :gutter="16">
          <el-col v-for="user in users" :key="user.uid" :span="8" class="mb-4">
            <el-card :body-style="{ padding: '18px 8px', textAlign: 'center' }" shadow="never">
              <el-avatar :src="user.avatar" size="large" class="mb-2" />
              <div class="font-semibold text-blue-700 text-lg">{{ user.nickname }}</div>
              <div v-if="showRealname && user.name" class="text-gray-500 text-sm mt-1">{{ user.name }}</div>
            </el-card>
          </el-col>
        </el-row>
        <div v-if="!loading && !error && users.length === 0" class="text-gray-400 text-center text-lg py-12">暂无人做过该题目
        </div>
      </el-card>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import 'element-plus/dist/index.css'
import { ElMessage } from 'element-plus'

const pid = ref('')
const users = ref([])
const loading = ref(false)
const error = ref('')
const inputRef = ref(null)

const allUsers = ref([]) // 所有用户信息
const selectedUids = ref(new Set()) // 选中的uid集合
const showRealname = ref(true) // 是否显示真实姓名

function toggleUser(uid) {
  if (selectedUids.value.has(uid)) {
    selectedUids.value.delete(uid)
  } else {
    selectedUids.value.add(uid)
  }
  selectedUids.value = new Set(selectedUids.value)
}

function reverseSelect() {
  const newSet = new Set()
  for (const user of allUsers.value) {
    if (!selectedUids.value.has(user.uid)) newSet.add(user.uid)
  }
  selectedUids.value = newSet
}

async function refreshUsers() {
  try {
    const res = await fetch('http://localhost:3000/users')
    if (!res.ok) throw new Error('获取用户信息失败')
    const data = await res.json()
    allUsers.value = data
    selectedUids.value = new Set(data.map(u => u.uid))
  } catch (e) {
    error.value = '获取用户信息失败'
    ElMessage.error(error.value)
  }
}

async function onQuery() {
  if (!pid.value.trim()) {
    error.value = '请输入题号'
    users.value = []
    ElMessage.warning(error.value)
    return
  }
  error.value = ''
  users.value = []
  loading.value = true
  try {
    const uids = Array.from(selectedUids.value)
    const res = await fetch(`http://localhost:3000/query/${encodeURIComponent(pid.value.trim())}?uids=${uids.join(',')}`)
    if (!res.ok) throw new Error('查询失败')
    const data = await res.json()
    if (Array.isArray(data) && data.length > 0) {
      users.value = data
    } else {
      users.value = []
    }
  } catch (e) {
    error.value = '查询失败，请检查服务端或网络'
    ElMessage.error(error.value)
  } finally {
    loading.value = false
  }
}

// 动态计算卡片宽度：最长nickname长度*每字符宽度+padding，最小90，最大140
const maxNicknameLen = computed(() => allUsers.value.reduce((max, u) => Math.max(max, (u.nickname || '').length), 0))
const cardWidth = computed(() => Math.max(90, Math.min(140, 10 * (maxNicknameLen.value || 8) + 30))) // 10px/字符+30px padding

function selectAll(e) {
  // 兼容 Element Plus input 组件
  if (e && e.target && typeof e.target.select === 'function') {
    e.target.select();
  } else if (inputRef.value && inputRef.value.input) {
    inputRef.value.input.select();
  }
}

onMounted(refreshUsers)
</script>

<style>
body {
  background: #f8fafc;
}
</style>