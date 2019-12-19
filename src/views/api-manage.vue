<template>
  <div class="api-manage">
    <div class="am-header">
      <el-button type="primary" @click="onOpenUpdate()">新建</el-button>
    </div>

    <!-- 列表 -->
    <el-table style="width: 100%" :data="tableData" v-loading="tableLoading" border>
      <el-table-column prop="id" label="ID"></el-table-column>
      <el-table-column prop="name" label="名称"></el-table-column>
      <el-table-column prop="comment" label="说明"></el-table-column>
      <el-table-column prop="content" label="SQL语句"></el-table-column>
      <el-table-column prop="timeUpdate" label="更新时间">
        <template slot-scope="scope">
          {{ scope.row.timeUpdate | time-format }}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="text" @click="onOpenUpdate(scope.row)">更新</el-button>
          <el-button type="text" @click="deleteDynamicApi(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      layout="prev, pager, next"
      :total="pagination.total"
      :current-page.sync="pagination.current"
      :page-size="pagination.pageSize"
      hide-on-single-page
      @current-change="handleCurrentChange">
    </el-pagination>

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
      pagination: {
        total: 0,
        current: 1,
        pageSize: 10
      },

      dialogShow: false,
      dialogObj: {}
    }
  },

  created () {
    window.apiManage = this
    this.queryDynamicApi()
  },

  methods: {
    handleCurrentChange () {
      this.queryDynamicApi()
    },
    onOpenUpdate (obj) {
      if (obj) {
        this.dialogObj = {
          id: obj.id,
          name: obj.name,
          comment: obj.comment,
          content: obj.content
        }
      } else {
        this.dialogObj = {}
      }
      this.dialogShow = true
    },
    queryDynamicApi () {
      this.tableLoading = true
      const { pageSize: limit, current: page } = this.pagination
      queryDynamicApi({ limit, page }).then(({ data }) => {
        this.tableData = data.data
        this.pagination.total = data.totalCount
      }).finally(() => {
        this.tableLoading = false
      })
    },
    onSave () {
      if (this.dialogObj.id) {
        this.updateDynamicApi()
      } else {
        this.createDynamicApi()
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
        this.dialogShow = false
        this.queryDynamicApi()
      })
    },
    deleteDynamicApi (id) {
      deleteDynamicApi({ id }).then(({ data }) => {
        this.queryDynamicApi()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.api-manage {
  min-height: inherit;
  .am-header {
    text-align: right;
    padding: 10px 24px;
  }
}
</style>

<style lang="scss">
.api-manage {
  .el-table {
    height: 100%;
    min-height: inherit;
  }
  .el-pagination {
    text-align: right;
  }
}
</style>
