<template>
  <el-dialog
    :title="createValue ? '创建诗词' : '更新诗词'"
    :close-on-click-modal="false"
    :visible.sync="visible"
    @opened="onDialogOpened"
    @closed="onDialogClosed"
  >
    <el-form :model="newPeotry" :rules="formRules" ref="ruleForm" label-width="60px">
      <el-form-item label="选集" prop="setId">
        <el-select v-model="newPeotry.setId" placeholder="请选择">
          <el-option v-for="set in peotrySets" :key="set.id" :value="set.id"
            :label="set.name">
            <div class="set_name">{{set.name}}</div>
            <span v-if="set.userId" class="set_delete" @click.stop="onDeletePeotrySet(set)">
              <i class="el-icon-delete"></i>
            </span>
          </el-option>
        </el-select>
        <i class="el-icon-plus peotry-set-add" @click="addPeotrySet"></i>
      </el-form-item>

      <el-form-item label="标题" prop="title">
        <el-input placeholder="标题" v-model="newPeotry.title"></el-input>
      </el-form-item>

      <el-form-item label="内容" prop="content">
        <el-input
          type="textarea"
          :autosize="{ minRows: 3, maxRows: 10}"
          maxlength="1000"
          placeholder="内容，不少于5个字符"
          v-model="newPeotry.content"
        ></el-input>
      </el-form-item>

      <el-form-item v-if="createValue" label="图片" class="pc-upload-form-item">
        <!-- todo: 图片文件自动上传 -->
        <!-- todo: 提供接口下载生产数据同步到本地开发、测试 -->
        <el-upload
          ref="upload"
          class="pc-upload"
          action=""
          list-type="picture-card"
          :file-list="imgFileList"
          :auto-upload="false"
          accept="image/png,image/jpeg"
          :on-change="handleImagesChange"
          :on-remove="handleImageRemove"
          multiple
        >
          <i class="el-icon-plus"></i>
        </el-upload>
      </el-form-item>

      <el-form-item label="尾注" prop="end">
        <el-input type="textarea" placeholder="尾注" v-model="newPeotry.end"></el-input>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          @click.stop="onCreateUpdate"
          :loading="inRequest"
        >{{createValue ? '创建' : '更新'}}</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
import {
  queryPeotrySets,
  createPeotry,
  updatePeotry,
  createPoetrySet,
  deletePeotrySet,
  uploadFiles
} from '@/api'

export default {
  props: {
    showCreate: {
      required: true,
      type: Boolean,
      default: false
    },
    peotry: {
      type: Object
    }
  },
  data () {
    return {
      visible: false,
      createValue: true,
      inRequest: false,
      newPeotry: {
        setId: null,
        title: '',
        content: '',
        imageNames: '',
        end: ''
      },
      imgFileList: [],
      setName: '',
      peotrySets: [],

      formRules: {
        setId: [{ required: true, message: '请选择选集', trigger: 'click' }],
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' },
          { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请选输入诗词内容', trigger: 'change' },
          {
            min: 5,
            max: 1000,
            message: '长度在 5 到 1000 个字符',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  watch: {
    showCreate () {
      this.visible = this.showCreate
      if (this.visible) {
        this.getPeotrySets()
      }
    },
    peotry (v) {
      this.imgFileList = []
      const peotry = v
      if (v && v.id) {
        this.visible = true
        this.createValue = false
        this.getPeotrySets()

        this.newPeotry = {
          id: peotry.id,
          userId: peotry.user && peotry.user.id,
          setId: peotry.set && peotry.set.id,
          title: peotry.title,
          content: peotry.content,
          end: peotry.end
        }
      } else {
        this.createValue = true
        this.newPeotry = {
          setId: null,
          title: '',
          content: '',
          imageNames: '',
          end: ''
        }
      }
    }
  },
  computed: {
    ...mapState({
      userInfo: state => state.user
    })
  },
  mounted () {
    window.peotryCreate = this
  },
  methods: {
    getPeotrySets (option) {
      queryPeotrySets(this.userInfo.id).then(resp => {
        const list = (resp.data && resp.data.data) || []
        this.peotrySets = list
        if (list.length) {
          if (option === 'first') {
            this.newPeotry.setId = list[0].id
          } else if (option === 'latest') {
            this.newPeotry.setId = list[list.length - 1].id
          }
        }
      })
    },
    handleImageRemove (file, fileList) {
      this.imgFileList = fileList
    },
    handleImagesChange (file, fileList) {
      this.imgFileList = fileList.slice(0, 10)
    },

    onCreateUpdate () {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          if (this.createValue) {
            this.checkImages()
          } else {
            this.onUpdate()
          }
        } else {
          this.$message.warning('请输入表单内容')
        }
      })
    },

    checkImages () {
      if (!this.imgFileList.length) {
        this.onCreate()
        return
      }
      const list = this.imgFileList
      const form = new FormData()
      for (let i = 0; i < list.length; i++) {
        if (list[i].size / 1024 / 1024 > 1) {
          this.$message.warning('上传的图片大小不能超过1M')
          break
        }
        form.append('file', list[i].raw)
      }

      this.inRequest = true
      uploadFiles({ pathType: 'peotry' }, form).then(resp => {
        const data = resp.data.data
        this.newPeotry.imageNames = JSON.stringify(data)
        this.onCreate()
      }).catch(() => {
        this.inRequest = false
      })
    },
    onCreate () {
      this.inRequest = true
      const newPeotry = this.newPeotry
      const data = {
        userId: this.userInfo.id,
        ...newPeotry
      }
      createPeotry(data)
        .then(resp => {
          this.$message.success('创建成功')
          this.currentId = resp.data.data
          this.$refs.ruleForm.resetFields()
          this.visible = false
        })
        .finally(() => {
          this.inRequest = false
        })
    },

    onUpdate () {
      const peotry = this.newPeotry
      if (!peotry || !peotry.id) return
      this.inRequest = true

      updatePeotry({
        id: peotry.id,
        userId: this.userInfo.id,
        setId: peotry.setId,
        title: peotry.title,
        content: peotry.content,
        end: peotry.end
      }).then(resp => {
        this.$message.success('保存成功')
        this.currentId = peotry.id
        this.visible = false
      })
    },

    addPeotrySet () {
      this.$prompt('请输入选集名字', '创建选集', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(({ value }) => {
          const length = value.trim().length
          if (length <= 0) {
            this.$message.warning('选集名称不能为空')
          } else if (length > 20) {
            this.$message.warning('选集名称不能超过20个字符')
          } else {
            createPoetrySet({ name: value }).then(resp => {
              this.$message.success('创建选集成功')
              this.getPeotrySets('latest')
            })
          }
        })
        .catch(() => {})
    },

    onDeletePeotrySet (set) {
      this.$confirm(`是否删除“${set.name}”?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deletePeotrySet({ id: set.id }).then(resp => {
          if (this.newPeotry.setId === set.id) {
            this.newPeotry.setId = null
          }
          this.$message.success('删除选集成功')
          this.getPeotrySets()
        })
      })
    },

    onDialogOpened () {
      this.inRequest = false
    },
    onDialogClosed () {
      this.$emit('on-close', {
        createValue: this.createValue,
        currentId: this.currentId
      })
      this.currentId = null
      this.createValue = true
      this.inRequest = false
    }
  }
}
</script>

<style lang="scss">
.peotry-set-add {
  margin-left: 10px;
  cursor: pointer;
  font-size: 20px;
}

.set_name {
  width: 85%;
  display: inline-block;
}

.set_delete {
  width: 15%;
  display: none;
  text-align: center;

  :active {
    color: #148acf;
  }
}

.hover .set_delete {
  display: inline-block;
}

.pc-upload-form-item .pc-upload {
  .el-upload--picture-card,
  .el-upload-list__item {
    width: 80px;
    height: 80px;
  }
  .el-upload--picture-card {
    line-height: 84px;
  }
}
</style>
