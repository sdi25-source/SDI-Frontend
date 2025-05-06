<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()">
        <h2
          id="sdiFrontendApp.productDeployementDetail.home.createOrEditLabel"
          data-cy="ProductDeployementDetailCreateUpdateHeading"
          v-text="t$('sdiFrontendApp.productDeployementDetail.home.createOrEditLabel')"
        ></h2>
        <div>
          <div class="form-group" v-if="productDeployementDetail.id">
            <label for="id" v-text="t$('global.field.id')"></label>
            <input type="text" class="form-control" id="id" name="id" v-model="productDeployementDetail.id" readonly />
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('sdiFrontendApp.productDeployementDetail.startDeployementDate')"
              for="product-deployement-detail-startDeployementDate"
            ></label>
            <b-input-group class="mb-3">
              <b-input-group-prepend>
                <b-form-datepicker
                  aria-controls="product-deployement-detail-startDeployementDate"
                  v-model="v$.startDeployementDate.$model"
                  name="startDeployementDate"
                  class="form-control"
                  :locale="currentLanguage"
                  button-only
                  today-button
                  reset-button
                  close-button
                >
                </b-form-datepicker>
              </b-input-group-prepend>
              <b-form-input
                id="product-deployement-detail-startDeployementDate"
                data-cy="startDeployementDate"
                type="text"
                class="form-control"
                name="startDeployementDate"
                :class="{ valid: !v$.startDeployementDate.$invalid, invalid: v$.startDeployementDate.$invalid }"
                v-model="v$.startDeployementDate.$model"
              />
            </b-input-group>
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('sdiFrontendApp.productDeployementDetail.endDeployementDate')"
              for="product-deployement-detail-endDeployementDate"
            ></label>
            <b-input-group class="mb-3">
              <b-input-group-prepend>
                <b-form-datepicker
                  aria-controls="product-deployement-detail-endDeployementDate"
                  v-model="v$.endDeployementDate.$model"
                  name="endDeployementDate"
                  class="form-control"
                  :locale="currentLanguage"
                  button-only
                  today-button
                  reset-button
                  close-button
                >
                </b-form-datepicker>
              </b-input-group-prepend>
              <b-form-input
                id="product-deployement-detail-endDeployementDate"
                data-cy="endDeployementDate"
                type="text"
                class="form-control"
                name="endDeployementDate"
                :class="{ valid: !v$.endDeployementDate.$invalid, invalid: v$.endDeployementDate.$invalid }"
                v-model="v$.endDeployementDate.$model"
              />
            </b-input-group>
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('sdiFrontendApp.productDeployementDetail.notes')"
              for="product-deployement-detail-notes"
            ></label>
            <textarea
              class="form-control"
              name="notes"
              id="product-deployement-detail-notes"
              data-cy="notes"
              :class="{ valid: !v$.notes.$invalid, invalid: v$.notes.$invalid }"
              v-model="v$.notes.$model"
            ></textarea>
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('sdiFrontendApp.productDeployementDetail.productDeployement')"
              for="product-deployement-detail-productDeployement"
            ></label>
            <select
              class="form-control"
              id="product-deployement-detail-productDeployement"
              data-cy="productDeployement"
              name="productDeployement"
              v-model="productDeployementDetail.productDeployement"
            >
              <option :value="null"></option>
              <option
                :value="
                  productDeployementDetail.productDeployement &&
                  productDeployementOption.id === productDeployementDetail.productDeployement.id
                    ? productDeployementDetail.productDeployement
                    : productDeployementOption
                "
                v-for="productDeployementOption in productDeployements"
                :key="productDeployementOption.id"
              >
                {{ productDeployementOption.refContract }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label
              v-text="t$('sdiFrontendApp.productDeployementDetail.infraComponentVersion')"
              for="product-deployement-detail-infraComponentVersion"
            ></label>
            <select
              class="form-control"
              id="product-deployement-detail-infraComponentVersions"
              data-cy="infraComponentVersion"
              multiple
              name="infraComponentVersion"
              v-if="productDeployementDetail.infraComponentVersions !== undefined"
              v-model="productDeployementDetail.infraComponentVersions"
            >
              <option
                :value="getSelected(productDeployementDetail.infraComponentVersions, infraComponentVersionOption, 'id')"
                v-for="infraComponentVersionOption in infraComponentVersions"
                :key="infraComponentVersionOption.id"
              >
                {{ infraComponentVersionOption.id }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label
              v-text="t$('sdiFrontendApp.productDeployementDetail.allowedModuleVersion')"
              for="product-deployement-detail-allowedModuleVersion"
            ></label>
            <select
              class="form-control"
              id="product-deployement-detail-allowedModuleVersions"
              data-cy="allowedModuleVersion"
              multiple
              name="allowedModuleVersion"
              v-if="productDeployementDetail.allowedModuleVersions !== undefined"
              v-model="productDeployementDetail.allowedModuleVersions"
            >
              <option
                :value="getSelected(productDeployementDetail.allowedModuleVersions, moduleVersionOption, 'id')"
                v-for="moduleVersionOption in moduleVersions"
                :key="moduleVersionOption.id"
              >
                {{ moduleVersionOption.id }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('sdiFrontendApp.productDeployementDetail.productVersion')"
              for="product-deployement-detail-productVersion"
            ></label>
            <select
              class="form-control"
              id="product-deployement-detail-productVersion"
              data-cy="productVersion"
              name="productVersion"
              v-model="productDeployementDetail.productVersion"
            >
              <option :value="null"></option>
              <option
                :value="
                  productDeployementDetail.productVersion && productVersionOption.id === productDeployementDetail.productVersion.id
                    ? productDeployementDetail.productVersion
                    : productVersionOption
                "
                v-for="productVersionOption in productVersions"
                :key="productVersionOption.id"
              >
                {{ productVersionOption.version }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('sdiFrontendApp.productDeployementDetail.deployementType')"
              for="product-deployement-detail-deployementType"
            ></label>
            <select
              class="form-control"
              id="product-deployement-detail-deployementType"
              data-cy="deployementType"
              name="deployementType"
              v-model="productDeployementDetail.deployementType"
            >
              <option :value="null"></option>
              <option
                :value="
                  productDeployementDetail.deployementType && deployementTypeOption.id === productDeployementDetail.deployementType.id
                    ? productDeployementDetail.deployementType
                    : deployementTypeOption
                "
                v-for="deployementTypeOption in deployementTypes"
                :key="deployementTypeOption.id"
              >
                {{ deployementTypeOption.type }}
              </option>
            </select>
          </div>
        </div>
        <div>
          <button type="button" id="cancel-save" data-cy="entityCreateCancelButton" class="btn btn-secondary" @click="previousState()">
            <font-awesome-icon icon="ban"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.cancel')"></span>
          </button>
          <button
            type="submit"
            id="save-entity"
            data-cy="entityCreateSaveButton"
            :disabled="v$.$invalid || isSaving"
            class="btn btn-primary"
          >
            <font-awesome-icon icon="save"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.save')"></span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
<script lang="ts" src="./product-deployement-detail-update.component.ts"></script>
