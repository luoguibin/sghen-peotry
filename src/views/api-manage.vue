<template>
  <div class="api-manage">
    <div class="am-header">
      <el-button @click="onConfirmTempPeotry">添加系统临时诗词</el-button>
      <el-button @click="queryDynamicApi()">刷新</el-button>
      <el-button type="primary" @click="onOpenUpdate()">新建</el-button>
    </div>

    <!-- 列表 -->
    <el-table style="width: 100%" :data="tableData" v-loading="tableLoading" stripe border>
      <el-table-column prop="id" label="ID" width="160px"></el-table-column>
      <el-table-column show-overflow-tooltip prop="suffixPath" label="路由" width="150px"></el-table-column>
      <el-table-column show-overflow-tooltip prop="name" label="名称" width="150px"></el-table-column>
      <el-table-column show-overflow-tooltip prop="comment" label="说明" width="200px"></el-table-column>
      <el-table-column show-overflow-tooltip prop="content" label="SQL语句"></el-table-column>
      <el-table-column prop="count" label="调用次数"></el-table-column>
      <el-table-column prop="timeUpdate" label="更新时间" width="160px">
        <template slot-scope="scope">{{ scope.row.timeUpdate | time-format }}</template>
      </el-table-column>

      <el-table-column label="配置" width="230px" fixed="right">
        <el-button-group slot-scope="scope">
          <el-button
            :type="scope.row.status === 2 ? 'primary' : ''"
            @click="onChangeStatus(2, scope.row)"
          >缓存</el-button>
          <el-button
            :type="scope.row.status === 1 ? 'primary' : ''"
            @click="onChangeStatus(1, scope.row)"
          >启用</el-button>
          <el-button
            :type="scope.row.status < 1 ? 'primary' : ''"
            @click="onChangeStatus(0, scope.row)"
          >禁用</el-button>
        </el-button-group>

        <!-- <template slot-scope="scope">
          <el-switch :value="scope.row.status" active-color="#13ce66" inactive-color="#dcdfe6"
            :active-value="2" :inactive-value="1" active-text="缓存" style="margin-right: 10px;"
            @change="onChangeStatus($event, scope.row)">
          </el-switch>
          <el-switch :value="scope.row.status" active-color="#13ce66" inactive-color="#dcdfe6"
            :active-value="1" :inactive-value="-1" active-text="启用" style="margin-right: 10px;"
            @change="onChangeStatus($event, scope.row)">
          </el-switch>
          <el-button type="text" :disabled="scope.row.status < 1" @click="onOpenTest(scope.row)">测试</el-button>
        </template>-->
      </el-table-column>
      <el-table-column label="操作" width="180px" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" @click="onOpenTest(scope.row)">测试</el-button>
          <el-button type="text" @click="onOpenUpdate(scope.row)">编辑</el-button>
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
      @current-change="handleCurrentChange"
    ></el-pagination>

    <!-- 新增或更新 -->
    <el-dialog :visible.sync="dialogShow" :title="dialogObj.id ? '编辑接口' : '创建接口'">
      <el-form ref="form" :model="dialogObj" :rules="rules" label-width="100px">
        <el-form-item label="路由" prop="suffixPath">
          <el-input v-model="dialogObj.suffixPath" placeholder="例如：peotry/list"></el-input>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="dialogObj.name"></el-input>
        </el-form-item>
        <el-form-item label="说明" prop="comment">
          <el-input v-model="dialogObj.comment"></el-input>
        </el-form-item>
        <el-form-item label="SQL语句" prop="content">
          <el-input type="textarea" v-model="dialogObj.content" :rows="5"></el-input>
        </el-form-item>
        <el-form-item label="是否启用" prop="status">
          <el-switch
            v-model="dialogObj.status"
            active-color="#13ce66"
            inactive-color="#dcdfe6"
            :active-value="1"
            :inactive-value="-1"
          ></el-switch>
        </el-form-item>
        <el-form-item label>
          <el-button @click="dialogShow = false">取消</el-button>
          <el-button type="primary" @click="onSave">保存</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 测试接口 -->
    <el-dialog
      :visible.sync="testShow"
      :title="'接口测试: ' + dialogObj.name"
      custom-class="am-test-dialog"
    >
      <div class="am-test-item" content="SQL语句">{{ dialogObj.content }}</div>
      <div class="am-test-item" content="查询参数">
        <el-input v-model="testParams"></el-input>
      </div>
      <div class="am-test-item am-test-result" content="测试结果">
        <el-scrollbar v-loading="testLoading">
          <div class="am-test-content">{{ testResult }}</div>
        </el-scrollbar>
      </div>
      <div style="text-align: right;">
        <el-button type="primary" @click="onTest">测试</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  queryDynamicApi,
  createDynamicApi,
  updateDynamicApi,
  deleteDynamicApi,
  getDynamicData,
  addTempPeotry
} from '@/api'

export default {
  name: 'ApiManage',

  data() {
    return {
      tableData: [],
      tableLoading: false,
      pagination: {
        total: 0,
        current: 1,
        pageSize: 10
      },

      dialogShow: false,
      testShow: false,
      testLoading: false,
      testParams: '',
      dialogObj: {},
      testResult: {},

      rules: {
        suffixPath: [
          { required: true, message: '请输入路由地址', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入接口名称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入SQL语句', trigger: 'blur' },
          {
            min: 10,
            max: 500,
            message: '长度在 10 到 500 个字符',
            trigger: 'blur'
          }
        ]
      }
    }
  },

  created() {
    window.apiManage = this
    this.queryDynamicApi()
  },

  methods: {
    /**
     * 添加系统临时诗词
     */
    onConfirmTempPeotry() {
      this.$confirm(
        '是否添加系统临时诗词，请确认此次操作的数据不重复？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          addTempPeotry().then(resp => {
            this.$message.success(resp.data.msg)
          })
        })
        .catch(e => {})
    },

    handleCurrentChange() {
      this.queryDynamicApi()
    },
    onChangeStatus(v, obj) {
      const data = {
        id: obj.id,
        suffixPath: obj.suffixPath,
        name: obj.name,
        comment: obj.comment,
        content: obj.content,
        status: v
      }
      updateDynamicApi(data).then(({ data }) => {
        obj.status = v
        obj.timeUpdate = data.data.timeUpdate
      })
    },
    onOpenUpdate(obj) {
      if (obj) {
        this.dialogObj = {
          id: obj.id,
          suffixPath: obj.suffixPath,
          name: obj.name,
          comment: obj.comment,
          content: obj.content,
          status: obj.status
        }
      } else {
        this.dialogObj = {}
      }
      this.dialogShow = true

      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    },
    queryDynamicApi() {
      this.tableLoading = true
      const { pageSize: limit, current: page } = this.pagination
      queryDynamicApi({ limit, page })
        .then(({ data }) => {
          this.tableData = data.data
          this.pagination.total = data.totalCount
        })
        .finally(() => {
          this.tableLoading = false
        })
    },
    onSave() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        if (this.dialogObj.id) {
          this.updateDynamicApi()
        } else {
          this.createDynamicApi()
        }
      })
    },
    onOpenTest(obj) {
      this.dialogObj = {
        id: obj.id,
        suffixPath: obj.suffixPath,
        name: obj.name,
        comment: obj.comment,
        content: obj.content,
        status: obj.status
      }
      this.testShow = true
      this.testLoading = false
      this.testParams = ''
      this.testResult = {}
      // this.onTest()
    },
    onTest() {
      const obj = this.dialogObj
      let params = {}
      if (this.testParams) {
        try {
          params = JSON.parse(this.testParams)
        } catch (e) {
          this.$message.warning('输入参数格式错误')
          return
        }
      }
      this.testLoading = true
      getDynamicData({ suffixPath: obj.suffixPath, ...params })
        .then(res => {
          this.testResult = res.data
          this.$message.success('接口测试成功')
        })
        .finally(() => {
          this.testLoading = false
        })
    },
    createDynamicApi() {
      createDynamicApi(this.dialogObj).then(({ data }) => {
        this.dialogShow = false
        this.queryDynamicApi()
      })
    },
    updateDynamicApi() {
      updateDynamicApi(this.dialogObj).then(({ data }) => {
        this.dialogShow = false
        this.queryDynamicApi()
      })
    },
    deleteDynamicApi(id) {
      this.$confirm('删除后不可恢复，确认是否删除？', '警告').then(() => {
        deleteDynamicApi({ id }).then(({ data }) => {
          this.queryDynamicApi()
        })
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
  .el-switch .el-switch__label--right {
    margin-left: 3px;
  }
}
.am-test-dialog {
  max-width: 1000px;
  .am-test-item {
    position: relative;
    border: 1px solid rgb(165, 165, 165);
    border-radius: 5px;
    padding: 10px;
    margin-bottom: 20px;
    &::before {
      content: attr(content);
      position: absolute;
      top: -10px;
      background-color: white;
      color: rgb(165, 165, 165);
    }
  }
  .am-test-result {
    min-height: 100px;
    max-height: 300px;
    &::before {
      content: attr(content);
    }
  }
  .el-scrollbar,
  .el-scrollbar__wrap {
    max-height: inherit;
  }
  .am-test-content {
    white-space: pre;
  }
}
</style>
