<template>
  <div class="carousel-peotry">
    <div v-if="peotry" class="content" v-html="peotry.content"></div>
  </div>
</template>

<script>
import { queryPeotries } from "@/api";

export default {
  name: "carousel-peotry",

  data() {
    return {
      peotry: null
    };
  },

  created() {
    this.queryPeotries();
  },

  methods: {
    queryPeotries() {
      queryPeotries({ setId: 10001 }).then(({ data }) => {
        this.peotry = data.data[0];
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.carousel-peotry {
  text-align: center;

  .content {
    white-space: pre-wrap;
    display: inline-block;
  }
}
</style>