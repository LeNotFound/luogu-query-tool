<template>
  <div class="min-h-screen flex flex-row items-start py-10 bg-gradient-to-b from-blue-100 to-white">
    <!-- 全局控制按钮 -->
    <button
      class="fixed top-4 right-8 z-50 px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
      @click="showRealname = !showRealname"
    >
      {{ showRealname ? '隐藏真实姓名' : '显示真实姓名' }}
    </button>
    <!-- 左侧：查询与用户选择器 -->
    <div class="w-80 flex flex-col items-stretch gap-6 px-6">
      <!-- 查询输入框 -->
      <form @submit.prevent="onQuery" class="flex gap-2 mb-2">
        <input
          v-model="pid"
          ref="inputRef"
          @focus="selectAll"
          @keyup.enter="onQuery"
          type="text"
          placeholder="请输入题号，如 P1000"
          class="px-4 py-2 rounded-l border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition w-48"
          autocomplete="off"
        />
        <button
          type="button"
          @click="onQuery"
          class="px-5 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600 transition"
        >
          查询
        </button>
      </form>
      <!-- 用户选择器 -->
      <div class="flex-1 overflow-y-auto bg-white rounded-lg shadow p-4 flex flex-col gap-2">
        <div class="font-bold text-blue-700 mb-2">用户选择器</div>
        <div class="flex flex-wrap gap-2 justify-center">
          <div
            v-for="user in allUsers"
            :key="user.uid"
            @click="toggleUser(user.uid)"
            :class="[
              'cursor-pointer select-none rounded-lg border flex flex-col items-center w-32 py-4 px-2',
              selectedUids.has(user.uid) ? 'bg-blue-100 border-blue-400 shadow' : 'bg-gray-50 border-gray-200',
              'transition hover:scale-105'
            ]"
          >
            <img :src="user.avatar" alt="avatar" class="w-12 h-12 rounded-full mb-2 object-cover" />
            <div class="font-semibold text-blue-700 text-base text-center">{{ user.nickname }}</div>
            <div v-if="showRealname" class="text-gray-500 text-xs text-center mt-1">{{ user.name }}</div>
            <div v-if="selectedUids.has(user.uid)" class="text-green-500 text-xs mt-1">已选中</div>
          </div>
        </div>
        <div class="flex gap-2 mt-4">
          <button @click="reverseSelect" class="flex-1 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded transition">反向选择</button>
          <button @click="refreshUsers" class="flex-1 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded transition">更新用户信息</button>
        </div>
      </div>
    </div>
    <!-- 右侧：查询结果 -->
    <div class="flex-1 flex flex-col items-center">
      <div
        class="mt-2 ml-8 w-full max-w-3xl p-6 rounded-2xl shadow-lg relative"
        :style="{
          boxShadow: users.length === 0 && !loading && !error ? '0 0 24px 4px #22c55e88' : (users.length > 0 ? '0 0 24px 4px #ef444488' : '0 0 0 0 transparent'),
          border: '2px solid ' + (users.length === 0 && !loading && !error ? '#22c55e' : (users.length > 0 ? '#ef4444' : '#e5e7eb')),
          background: '#fff',
          minHeight: '320px',
        }"
      >
        <!-- 可用性提示 -->
        <div class="mb-4 text-lg font-semibold text-center">
          <template v-if="loading">查询中...</template>
          <template v-else-if="error"><span class="text-red-500">{{ error }}</span></template>
          <template v-else-if="users.length === 0">未查询到AC记录，本题可用！</template>
          <template v-else>如下用户做过此题，请谨慎选用</template>
        </div>
        <!-- 用户卡片区 -->
        <div v-if="users.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div
            v-for="user in users"
            :key="user.uid"
            class="bg-white rounded-lg shadow hover:shadow-lg transition flex flex-col items-center justify-center p-6 border border-blue-100"
          >
            <img :src="user.avatar" alt="avatar" class="w-16 h-16 rounded-full border-2 border-blue-200 mb-2 object-cover" />
            <div class="font-semibold text-blue-700 text-lg text-center">{{ user.nickname }}</div>
            <div v-if="showRealname" class="text-gray-500 text-sm text-center mt-1">{{ user.name }}</div>
          </div>
        </div>
        <div v-else-if="!loading && !error" class="text-gray-400 text-center text-lg py-12">暂无人做过该题目</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const pid = ref('')
const users = ref([])
const loading = ref(false)
const error = ref('')
const inputRef = ref(null)

const allUsers = ref([]) // 所有用户信息
const selectedUids = ref(new Set()) // 选中的uid集合
const showRealname = ref(true) // 是否显示真实姓名

function selectAll(e) {
  e.target.select()
}

// 切换用户选中状态
function toggleUser(uid) {
  if (selectedUids.value.has(uid)) {
    selectedUids.value.delete(uid)
  } else {
    selectedUids.value.add(uid)
  }
  // 触发响应式
  selectedUids.value = new Set(selectedUids.value)
}

// 反向选择
function reverseSelect() {
  const newSet = new Set()
  for (const user of allUsers.value) {
    if (!selectedUids.value.has(user.uid)) newSet.add(user.uid)
  }
  selectedUids.value = newSet
}

// 刷新用户信息
async function refreshUsers() {
  try {
    const res = await fetch('http://localhost:3000/users')
    if (!res.ok) throw new Error('获取用户信息失败')
    const data = await res.json()
    allUsers.value = data
    // 默认全选
    selectedUids.value = new Set(data.map(u => u.uid))
  } catch (e) {
    error.value = '获取用户信息失败'
  }
}

// 查询题号
async function onQuery() {
  if (!pid.value.trim()) {
    error.value = '请输入题号'
    users.value = []
    return
  }
  error.value = ''
  users.value = []
  loading.value = true
  try {
    // 只查询选中的用户
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
  } finally {
    loading.value = false
  }
}

onMounted(refreshUsers)
</script>

<style>
/* 可选：自定义滚动条美化 */
::-webkit-scrollbar {
  width: 8px;
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
</style>