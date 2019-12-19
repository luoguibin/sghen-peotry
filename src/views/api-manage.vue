<template>
  <div class="api-manage">
    <div class="am-header">
      <el-button type="primary" @click="onOpenUpdate()">新建</el-button>
    </div>

    <!-- 列表 -->
    <el-table height="100%" :data="tableData" :loading="tableLoading" border>
      <el-table-column prop="id" label="ID"></el-table-column>
      <el-table-column prop="name" label="名称"></el-table-column>
      <el-table-column prop="comment" label="说明"></el-table-column>
      <el-table-column prop="content" label="SQL语句"></el-table-column>
      <el-table-column prop="timeUpdate" label="更新时间">
        <template slot-scope="scope">
          {{ scope.row.timeUpdate | time-format }}
        </template>
      </el-table-column>
      <el-table-column label="操作" slot-scope="scope">
        <el-button type="text" @click="onOpenUpdate(scope.row)">更新</el-button>
        <el-button type="text" @click="deleteDynamicApi(scope.row.id)">删除</el-button>
      </el-table-column>
    </el-table>

    <!-- 新增或更新 -->
    <el-dialog :visible.sync="dialogShow">
      <el-form label-width="100px">
        <el-form-item label="名称" required>
          <el-input v-model="dialogObj.name"></el-input>
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="dialogObj.comment"></el-input>
        </el-form-item>
        <el-form-item label="SQL语句" required>
          <el-input type="textarea" v-model="dialogObj.content"></el-input>
        </el-form-item>
        <el-form-item label="">
          <el-button @click="dialogShow = false">取消</el-button>
          <el-button type="primary" @click="onSave">保存</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import {
  queryDynamicApi,
  createDynamicApi,
  updateDynamicApi,
  deleteDynamicApi
} from '@/api'

export default {
  name: 'ApiManage',

  data () {
    return {
      tableData: [],
      tableLoading: false,

      dialogShow: false,
      dialogObj: {}
    }
  },

  created () {
    window.apiManage = this
    this.queryDynamicApi()
  },

  methods: {
    onOpenUpdate (obj) {
      this.dialogObj = obj || {}
      this.isCreate = !obj
      this.dialogShow = true
    },
    queryDynamicApi () {
      this.tableLoading = true
      queryDynamicApi().then(({ data }) => {
        this.tableData = data.data
      }).finally(() => {
        this.tableLoading = true
      })
    },
    onSave () {
      if (this.isCreate) {
        this.createDynamicApi()
      } else {
        this.updateDynamicApi()
      }
    },
    createDynamicApi () {
      createDynamicApi(this.dialogObj).then(({ data }) => {
        this.dialogShow = false
        this.queryDynamicApi()
      })
    },
    updateDynamicApi () {
      updateDynamicApi(this.dialogObj).then(({ data }) => {
        console.log(data)
      })
    },
    deleteDynamicApi (id) {
      deleteDynamicApi({ id }).then(({ data }) => {
        console.log(data)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.api-manage {
  .am-header {
    text-align: right;
    padding: 10px 24px;
  }
}
</style>
