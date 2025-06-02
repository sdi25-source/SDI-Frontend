"use client"

import { type Ref, defineComponent, inject, onMounted, ref, computed, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"

import ProductDeploymentService from "./product-deployement.service"
import ProductDeployementDetailService from "../product-deployement-detail/product-deployement-detail.service"
import ClientService from "../client/client.service"
import DeployementTypeService from "../deployement-type/deployement-type.service"
import ProductVersionService from "../product-version/product-version.service"
import type { IProductDeployment } from "@/shared/model/product-deployement.model"
import type { IProductDeployementDetail } from "@/shared/model/product-deployement-detail.model"
import type { IClient } from "@/shared/model/client.model"
import { useAlertService } from "@/shared/alert/alert.service"
import ProductService from "../product/product.service"
import ModuleDeployementService from "../module-deployement/module-deployement.service"
import ModuleVersionService from "../module-version/module-version.service"
import ModuleService from "../module/module.service"
import type { IModule } from "@/shared/model/module.model"
import type { IModuleVersion } from "@/shared/model/module-version.model"
import InfraComponentVersionService from "../infra-component-version/infra-component-version.service"
import InfraComponentService from "../infra-component/infra-component.service"

export default defineComponent({
  computed: {
    IProductDeployementDetail() {
      return this.IProductDeployementDetail
    },
    IProductDeployment() {
      return this.IProductDeployment
    },
  },
  compatConfig: { MODE: 3 },
  name: "ProductDeployment",
  setup() {
    const { t: t$ } = useI18n()
    const router = useRouter()
    const productDeploymentService = inject("productDeploymentService", () => new ProductDeploymentService())
    const productDeployementDetailService = inject(
      "productDeployementDetailService",
      () => new ProductDeployementDetailService(),
    )
    const clientService = inject("clientService", () => new ClientService())
    const deployementTypeService = inject("deployementTypeService", () => new DeployementTypeService())
    const productVersionService = inject("productVersionService", () => new ProductVersionService())
    const alertService = inject("alertService", () => useAlertService(), true)
    const productService = inject("productService", () => new ProductService())
    const moduleDeployementService = inject("moduleDeployementService", () => new ModuleDeployementService())
    const moduleVersionService = inject("moduleVersionService", () => new ModuleVersionService())
    const moduleService = inject("moduleService", () => new ModuleService())
    const infraComponentVersionService = inject(
      "infraComponentVersionService",
      () => new InfraComponentVersionService(),
    )
    const infraComponentService = inject("infraComponentService", () => new InfraComponentService())

    // État principal
    const productDeployments: Ref<IProductDeployment[]> = ref([])
    const allProductDeployments: Ref<IProductDeployment[]> = ref([])
    const clients: Ref<IClient[]> = ref([])
    const products: Ref<any[]> = ref([])
    const viewMode = ref("list")
    const searchTerm = ref("")
    const searchTimeout = ref(null)
    const selectedClientFilter = ref(null)
    const selectedProductFilter = ref(null)

    // Pagination pour la liste principale
    const currentPage = ref(1)
    const itemsPerPage = ref(5)
    const totalItems = ref(0)

    const isFetching = ref(false)
    const showAddRow = ref(false)

    const removeId: Ref<number> = ref(null)
    const removeEntity = ref<any>(null)

    // État pour la sélection et les onglets - MODIFIÉ pour le nouveau design
    const selectedProductDeployment = ref(null)
    const showModuleSettingsModal = ref(false)
    const selectedDetail = ref(null)
    const selectedModuleVersionId = ref("")
    const selectedAllowedModuleVersions = ref([])

    const newProductDeployment = ref({
      refContract: "",
      createDate: new Date().toISOString().split("T")[0],
      updateDate: new Date().toISOString().split("T")[0],
      notes: "",
      client: null,
      product: null,
    })

    // État pour les détails
    const productDeployementDetails: Ref<IProductDeployementDetail[]> = ref([])
    const allProductDeployementDetails = ref([])
    const deployementTypes = ref([])
    const productVersions = ref([])
    const moduleVersions = ref([])
    const detailSearchTerm = ref("")
    const detailSearchTimeout = ref(null)
    const showAddDetailRow = ref(false)
    const removeDetailId = ref(null)
    const removeDetailEntity = ref<any>(null)

    // Pagination pour les détails
    const detailCurrentPage = ref(1)
    const detailItemsPerPage = ref(10)
    const detailTotalItems = ref(0)

    const newProductDeployementDetail = ref({
      startDeployementDate: new Date().toISOString().split("T")[0],
      endDeployementDate: "",
      notes: "",
      productDeployement: null,
      deployementType: null,
      productVersion: null,
      infraComponentVersions: [],
      allowedModuleVersions: [],
      isSelected: false,
    })

    // Variables pour la sélection séparée des modules
    const selectedModuleId = ref("")
    const selectedVersionId = ref("")
    const filteredModules: Ref<IModule[]> = ref([])
    const availableVersionsForSelectedModule: Ref<IModuleVersion[]> = ref([])
    const allModules: Ref<IModule[]> = ref([])

    // Variables pour les onglets
    const activeTab = ref("deployements")

    // Variables pour les popups d'information
    const showDetailInfoModal = ref(false)
    const selectedDetailInfo = ref(null)
    const showInfraInfoModal = ref(false)
    const selectedInfraInfo = ref(null)

    // Variables pour l'infrastructure
    const infraComponentVersions = ref([])

    // Computed properties pour la liste principale
    const paginatedProductDeployments = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return productDeployments.value.slice(start, end)
    })

    const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))

    const isPrevDisabled = computed(() => currentPage.value <= 1)
    const isNextDisabled = computed(() => currentPage.value >= totalPages.value)

    const paginationInfo = computed(() => {
      if (totalItems.value === 0) return "0-0 / 0"
      const start = (currentPage.value - 1) * itemsPerPage.value + 1
      const end = Math.min(start + itemsPerPage.value - 1, totalItems.value)
      return `${start}-${end} / ${totalItems.value}`
    })

    // Computed properties pour les détails
    const paginatedProductDeployementDetails = computed(() => {
      const start = (detailCurrentPage.value - 1) * detailItemsPerPage.value
      const end = start + detailItemsPerPage.value
      return productDeployementDetails.value.slice(start, end)
    })

    const detailTotalPages = computed(() => Math.ceil(detailTotalItems.value / detailItemsPerPage.value))

    const isDetailPrevDisabled = computed(() => detailCurrentPage.value <= 1)
    const isDetailNextDisabled = computed(() => detailCurrentPage.value >= detailTotalPages.value)

    const detailPaginationInfo = computed(() => {
      if (detailTotalItems.value === 0) return "0-0 / 0"
      const start = (detailCurrentPage.value - 1) * detailItemsPerPage.value + 1
      const end = Math.min(start + detailItemsPerPage.value - 1, detailTotalItems.value)
      return `${start}-${end} / ${detailTotalItems.value}`
    })

    // NOUVELLE FONCTION - Toggle selection comme dans Product
    const toggleProductDeploymentSelection = (productDeployment) => {
      if (selectedProductDeployment.value && selectedProductDeployment.value.id === productDeployment.id) {
        // Si on clique sur le même déploiement, on le désélectionne
        selectedProductDeployment.value = null
        productDeployementDetails.value = []
        allProductDeployementDetails.value = []
      } else {
        // Sélectionner le nouveau déploiement
        selectedProductDeployment.value = {
          ...productDeployment,
          productId: productDeployment.product ? productDeployment.product.id : productDeployment.productId,
        }

        // Initialiser le nouveau détail avec le déploiement sélectionné
        newProductDeployementDetail.value.productDeployement = {
          id: productDeployment.id,
          refContract: productDeployment.refContract,
        }

        // Charger les détails du déploiement
        loadDeploymentDetails()
      }
    }

    // NOUVELLE FONCTION - Retour à la liste
    const returnToProductDeploymentList = () => {
      selectedProductDeployment.value = null
      productDeployementDetails.value = []
      allProductDeployementDetails.value = []
      showAddDetailRow.value = false
    }

    // NOUVELLE FONCTION - Charger les détails du déploiement
    const loadDeploymentDetails = async () => {
      try {
        await retrieveDeployementTypes()
        await retrieveProductVersions()
        await retrieveProductDeployementDetails()
        await retrieveModuleVersions()
        await retrieveAllModulesForProductVersion()
        await retrieveInfraComponentVersionsWithRelations() // Utiliser la nouvelle fonction
      } catch (error) {
        console.error("Error loading deployment details:", error)
      }
    }

    // Fonctions pour la liste principale
    const goToNextPage = () => {
      if (!isNextDisabled.value) currentPage.value++
    }

    const goToPrevPage = () => {
      if (!isPrevDisabled.value) currentPage.value--
    }

    const updateTotalItems = () => {
      totalItems.value = productDeployments.value?.length || 0
    }

    const applyFilters = () => {
      productDeployments.value = [...allProductDeployments.value]

      if (searchTerm.value.trim() !== "") {
        const searchLower = searchTerm.value.toLowerCase()
        productDeployments.value = productDeployments.value.filter((pd) => {
          return (
            (pd.refContract && pd.refContract.toLowerCase().includes(searchLower)) ||
            (pd.notes && pd.notes.toLowerCase().includes(searchLower)) ||
            (pd.client && pd.client.name && pd.client.name.toLowerCase().includes(searchLower))
          )
        })
      }

      if (selectedClientFilter.value) {
        productDeployments.value = productDeployments.value.filter(
          (pd) => pd.client && pd.client.id === selectedClientFilter.value.id,
        )
      }

      if (selectedProductFilter.value) {
        productDeployments.value = productDeployments.value.filter(
          (pd) =>
            (pd.product && pd.product.id === selectedProductFilter.value.id) ||
            pd.productId === selectedProductFilter.value.id,
        )
      }

      updateTotalItems()
      currentPage.value = 1
    }

    const handleSearch = () => {
      if (searchTimeout.value) clearTimeout(searchTimeout.value)
      searchTimeout.value = setTimeout(() => {
        applyFilters()
      }, 300)
    }

    const resetFilters = () => {
      searchTerm.value = ""
      selectedClientFilter.value = null
      selectedProductFilter.value = null
      productDeployments.value = [...allProductDeployments.value]
      updateTotalItems()
      currentPage.value = 1
    }

    const retrieveProducts = async () => {
      try {
        const res = await productService().retrieve()
        products.value = res.data
      } catch (err) {
        alertService.showHttpError(err.response)
      }
    }

    const retrieveProductDeployments = async () => {
      isFetching.value = true
      try {
        const res = await productDeploymentService().retrieve()
        const deployments = res.data.map((pd) => ({
          ...pd,
          isEditing: false,
          showDropdown: false,
          originalData: JSON.parse(JSON.stringify(pd)),
        }))

        for (const deployment of deployments) {
          if (deployment.productId) {
            const product = products.value.find((p) => p.id === deployment.productId)
            if (product) {
              deployment.productName = product.name
            }
          }
        }

        productDeployments.value = deployments
        allProductDeployments.value = [...productDeployments.value]
        updateTotalItems()
      } catch (err) {
        alertService.showHttpError(err.response)
      } finally {
        isFetching.value = false
      }
    }

    const retrieveClients = async () => {
      try {
        const res = await clientService().retrieve()
        clients.value = res.data
      } catch (err) {
        alertService.showHttpError(err.response)
      }
    }

    const handleSyncList = () => retrieveProductDeployments()

    const prepareRemove = (instance: IProductDeployment) => {
      removeId.value = instance.id
      removeEntity.value.show()
    }

    const closeDialog = () => removeEntity.value.hide()

    const removeProductDeployment = async () => {
      try {
        await productDeploymentService().delete(removeId.value)
        alertService.showInfo(t$("sdiFrontendApp.productDeployment.deleted", { param: removeId.value }).toString(), {
          variant: "danger",
        })

        productDeployments.value = productDeployments.value.filter((pd) => pd.id !== removeId.value)
        allProductDeployments.value = allProductDeployments.value.filter((pd) => pd.id !== removeId.value)
        updateTotalItems()

        removeId.value = null
        closeDialog()
      } catch (error) {
        alertService.showHttpError(error.response)
      }
    }

    const saveNewProductDeployment = async () => {
      if (!newProductDeployment.value.refContract) {
        alertService.showAlert("Le champ référence contrat est requis.", "danger")
        return
      }

      if (!newProductDeployment.value.client) {
        alertService.showAlert("Le champ client est requis.", "danger")
        return
      }

      if (!newProductDeployment.value.product) {
        alertService.showAlert("Le champ produit est requis.", "danger")
        return
      }

      try {
        const toSend = {
          ...newProductDeployment.value,
          productId: newProductDeployment.value.product ? newProductDeployment.value.product.id : null,
        }

        const response = await productDeploymentService().create(toSend)
        const added = {
          ...response,
          isEditing: false,
          showDropdown: false,
          originalData: JSON.parse(JSON.stringify(response)),
        }

        productDeployments.value.push(added)
        allProductDeployments.value.push(added)
        updateTotalItems()

        showAddRow.value = false
        newProductDeployment.value = {
          refContract: "",
          createDate: new Date().toISOString().split("T")[0],
          updateDate: new Date().toISOString().split("T")[0],
          notes: "",
          client: null,
          product: null,
        }

        alertService.showAlert("Déploiement ajouté avec succès.", "success", { variant: "success" })
      } catch (error) {
        alertService.showHttpError(error.response)
      }
    }

    const cancelNewProductDeployment = () => {
      showAddRow.value = false
      newProductDeployment.value = {
        refContract: "",
        createDate: new Date().toISOString().split("T")[0],
        updateDate: new Date().toISOString().split("T")[0],
        notes: "",
        client: null,
        product: null,
      }
    }

    const editProductDeployment = (productDeployment) => {
      productDeployment.originalData = JSON.parse(
        JSON.stringify({
          refContract: productDeployment.refContract,
          createDate: productDeployment.createDate,
          updateDate: productDeployment.updateDate,
          notes: productDeployment.notes,
          client: productDeployment.client ? { ...productDeployment.client } : null,
          product: productDeployment.product ? { ...productDeployment.product } : null,
          productId: productDeployment.product?.id ?? productDeployment.productId,
        }),
      )
      productDeployment.isEditing = true
    }

    const saveProductDeployment = async (productDeployment) => {
      if (!productDeployment.refContract) {
        alertService.showAlert("Le champ référence contrat est requis.", "danger")
        return
      }

      if (!productDeployment.client) {
        alertService.showAlert("Le champ client est requis.", "danger")
        return
      }

      if (!productDeployment.product) {
        alertService.showAlert("Le champ produit est requis.", "danger")
        return
      }

      try {
        const toSend = {
          id: productDeployment.id,
          refContract: productDeployment.refContract,
          createDate: productDeployment.createDate,
          updateDate: new Date().toISOString().split("T")[0],
          notes: productDeployment.notes,
          client: productDeployment.client,
          product: productDeployment.product,
          productId: productDeployment.product ? productDeployment.product.id : null,
        }

        const response = await productDeploymentService().update(toSend)
        const updated = {
          ...response,
          isEditing: false,
          showDropdown: false,
          originalData: JSON.parse(JSON.stringify(response)),
        }

        const index = productDeployments.value.findIndex((pd) => pd.id === productDeployment.id)
        if (index !== -1) productDeployments.value.splice(index, 1, updated)

        const allIndex = allProductDeployments.value.findIndex((pd) => pd.id === productDeployment.id)
        if (allIndex !== -1) allProductDeployments.value.splice(allIndex, 1, updated)

        alertService.showAlert("Déploiement mis à jour avec succès.", "success", { variant: "success" })
      } catch (error) {
        alertService.showHttpError(error.response)
      }
    }

    const cancelEdit = (productDeployment) => {
      productDeployment.refContract = productDeployment.originalData.refContract
      productDeployment.createDate = productDeployment.originalData.createDate
      productDeployment.updateDate = productDeployment.originalData.updateDate
      productDeployment.notes = productDeployment.originalData.notes
      productDeployment.client = productDeployment.originalData.client
        ? { ...productDeployment.originalData.client }
        : null
      productDeployment.product = productDeployment.originalData.product
        ? { ...productDeployment.originalData.product }
        : null
      productDeployment.isEditing = false
    }

    // Fonctions pour les détails
    const goToDetailNextPage = () => {
      if (!isDetailNextDisabled.value) detailCurrentPage.value++
    }

    const goToDetailPrevPage = () => {
      if (!isDetailPrevDisabled.value) detailCurrentPage.value--
    }

    const updateDetailTotalItems = () => {
      detailTotalItems.value = productDeployementDetails.value?.length || 0
    }

    const handleDetailSearch = () => {
      if (detailSearchTimeout.value) clearTimeout(detailSearchTimeout.value)
      detailSearchTimeout.value = setTimeout(() => {
        if (detailSearchTerm.value.trim() === "") {
          productDeployementDetails.value = [...allProductDeployementDetails.value]
        } else {
          const searchLower = detailSearchTerm.value.toLowerCase()
          productDeployementDetails.value = allProductDeployementDetails.value.filter((detail) => {
            return (
              (detail.notes && detail.notes.toLowerCase().includes(searchLower)) ||
              (detail.deployementType &&
                detail.deployementType.type &&
                detail.deployementType.type.toLowerCase().includes(searchLower)) ||
              (detail.productVersion &&
                detail.productVersion.version &&
                detail.productVersion.version.toLowerCase().includes(searchLower))
            )
          })
        }
        updateDetailTotalItems()
        detailCurrentPage.value = 1
      }, 300)
    }

    const findDetailsByProductDeployementId = async (id) => {
      try {
        const response = await productDeployementDetailService().retrieve()
        const filteredDetails = response.data.filter(
          (detail) => detail.productDeployement && detail.productDeployement.id === id,
        )

        return {
          data: filteredDetails,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          config: response.config,
        }
      } catch (error) {
        console.error(`Erreur lors de la récupération des détails pour le déploiement ${id}:`, error)
        throw error
      }
    }

    const retrieveProductDeployementDetails = async () => {
      try {
        if (selectedProductDeployment.value) {
          const res = await findDetailsByProductDeployementId(selectedProductDeployment.value.id)
          productDeployementDetails.value = res.data.map(
            (detail) =>
              ({
                ...detail,
                isSelected: false,
                isEditing: false,
                originalData: JSON.parse(JSON.stringify(detail)),
              }) as IProductDeployementDetail,
          )

          allProductDeployementDetails.value = [...productDeployementDetails.value]
          updateDetailTotalItems()
        }
      } catch (err) {
        alertService.showHttpError(err.response)
      }
    }

    const retrieveDeployementTypes = async () => {
      try {
        const res = await deployementTypeService().retrieve()
        deployementTypes.value = res.data
      } catch (err) {
        alertService.showHttpError(err.response)
      }
    }

    const retrieveProductVersions = async () => {
      try {
        const res = await productVersionService().retrieve()
        const allVersions = res.data

        if (selectedProductDeployment.value && selectedProductDeployment.value.productId) {
          productVersions.value = allVersions.filter(
            (version) => version.product && version.product.id === selectedProductDeployment.value.productId,
          )
        } else {
          productVersions.value = allVersions
        }
      } catch (err) {
        alertService.showHttpError(err.response)
      }
    }

    const retrieveModuleVersions = async () => {
      try {
        const res = await moduleVersionService().retrieve()
        moduleVersions.value = res.data
      } catch (err) {
        alertService.showHttpError(err.response)
      }
    }

    const getFilteredProductVersions = (productId) => {
      if (!productId) return productVersions.value
      return productVersions.value.filter((version) => version.product && version.product.id === productId)
    }

    const prepareRemoveDetail = (instance) => {
      removeDetailId.value = instance.id
      removeDetailEntity.value.show()
    }

    const closeDetailDialog = () => removeDetailEntity.value.hide()

    const removeProductDeployementDetail = async () => {
      try {
        await productDeployementDetailService().delete(removeDetailId.value)
        alertService.showInfo("Détail supprimé avec succès", { variant: "success" })

        productDeployementDetails.value = productDeployementDetails.value.filter(
          (detail) => detail.id !== removeDetailId.value,
        )
        allProductDeployementDetails.value = allProductDeployementDetails.value.filter(
          (detail) => detail.id !== removeDetailId.value,
        )
        updateDetailTotalItems()

        removeDetailId.value = null
        closeDetailDialog()
      } catch (error) {
        alertService.showHttpError(error.response)
      }
    }

    const saveNewProductDeployementDetail = async () => {
      if (!newProductDeployementDetail.value.deployementType) {
        alertService.showAlert("Le champ type de déploiement est requis.", "danger")
        return
      }

      if (!newProductDeployementDetail.value.productVersion) {
        alertService.showAlert("Le champ version du produit est requis.", "danger")
        return
      }

      try {
        newProductDeployementDetail.value.productDeployement = {
          id: selectedProductDeployment.value.id,
          refContract: selectedProductDeployment.value.refContract,
        }

        const response = await productDeployementDetailService().create(newProductDeployementDetail.value)
        const added = {
          ...response,
          isSelected: false,
          isEditing: false,
          originalData: JSON.parse(JSON.stringify(response)),
        }

        productDeployementDetails.value.push(added)
        allProductDeployementDetails.value.push(added)
        updateDetailTotalItems()

        showAddDetailRow.value = false
        newProductDeployementDetail.value = {
          startDeployementDate: new Date().toISOString().split("T")[0],
          endDeployementDate: "",
          notes: "",
          productDeployement: {
            id: selectedProductDeployment.value.id,
            refContract: selectedProductDeployment.value.refContract,
          },
          deployementType: null,
          productVersion: null,
          infraComponentVersions: [],
          allowedModuleVersions: [],
          isSelected: false,
        }

        alertService.showAlert("Détail ajouté avec succès.", "success", { variant: "success" })
      } catch (error) {
        alertService.showHttpError(error.response)
      }
    }

    const cancelNewProductDeployementDetail = () => {
      showAddDetailRow.value = false
      newProductDeployementDetail.value = {
        startDeployementDate: new Date().toISOString().split("T")[0],
        endDeployementDate: "",
        notes: "",
        productDeployement: selectedProductDeployment.value
          ? {
            id: selectedProductDeployment.value.id,
            refContract: selectedProductDeployment.value.refContract,
          }
          : null,
        deployementType: null,
        productVersion: null,
        infraComponentVersions: [],
        allowedModuleVersions: [],
        isSelected: false,
      }
    }

    const editProductDeployementDetail = (detail) => {
      detail.originalData = JSON.parse(
        JSON.stringify({
          startDeployementDate: detail.startDeployementDate,
          endDeployementDate: detail.endDeployementDate,
          notes: detail.notes,
          deployementType: detail.deployementType,
          productVersion: detail.productVersion,
          isSelected: detail.isSelected,
          infraComponentVersions: detail.infraComponentVersions || [],
        }),
      )
      detail.isEditing = true
    }

    const saveProductDeployementDetail = async (detail) => {
      if (!detail.deployementType) {
        alertService.showAlert("Le champ type de déploiement est requis.", "danger")
        return
      }

      if (!detail.productVersion) {
        alertService.showAlert("Le champ version du produit est requis.", "danger")
        return
      }

      try {
        const toSend = {
          id: detail.id,
          startDeployementDate: detail.startDeployementDate,
          endDeployementDate: detail.endDeployementDate,
          notes: detail.notes,
          productDeployement: detail.productDeployement,
          deployementType: detail.deployementType,
          productVersion: detail.productVersion,
          infraComponentVersions: detail.infraComponentVersions || [],
          allowedModuleVersions: detail.allowedModuleVersions || [],
        }

        const response = await productDeployementDetailService().update(toSend)
        const updated = {
          ...response,
          isSelected: detail.isSelected,
          isEditing: false,
          originalData: null,
        }

        const index = productDeployementDetails.value.findIndex((d) => d.id === detail.id)
        if (index !== -1) productDeployementDetails.value.splice(index, 1, updated)

        const allIndex = allProductDeployementDetails.value.findIndex((d) => d.id === detail.id)
        if (allIndex !== -1) allProductDeployementDetails.value.splice(allIndex, 1, updated)

        alertService.showAlert("Détail mis à jour avec succès.", "success", { variant: "success" })
      } catch (error) {
        alertService.showHttpError(error.response)
      }
    }

    const cancelEditDetail = (detail) => {
      detail.startDeployementDate = detail.originalData.startDeployementDate
      detail.endDeployementDate = detail.originalData.endDeployementDate
      detail.notes = detail.originalData.notes
      detail.deployementType = detail.originalData.deployementType
      detail.productVersion = detail.originalData.productVersion
      detail.isSelected = detail.originalData.isSelected
      detail.infraComponentVersions = detail.originalData.infraComponentVersions || []
      detail.isEditing = false
    }

    // Récupérer tous les modules
    const retrieveAllModules = async () => {
      try {
        const res = await moduleService().retrieve()
        allModules.value = res.data
        filterModulesByProduct()
      } catch (err) {
        alertService.showHttpError(err.response)
      }
    }

    // Récupérer tous les modules versions pour le productversion
    const retrieveAllModulesForProductVersion = async () => {
      try {
        // Récupérer tous les modules versions disponibles
        const res = await moduleVersionService().retrieve()
        allModules.value = res.data

        // Plus de filtrage par produit - on récupère tout
        filteredModules.value = allModules.value
      } catch (err) {
        alertService.showHttpError(err.response)
      }
    }

    // Filtrer les modules par produit
    const filterModulesByProduct = () => {
      if (selectedProductDeployment.value && selectedProductDeployment.value.productId) {
        filteredModules.value = allModules.value.filter(
          (module) => module.productId === selectedProductDeployment.value.productId,
        )
      } else {
        filteredModules.value = allModules.value
      }
    }

    // Récupérer les composants d'infrastructure avec toutes les relations
    const retrieveInfraComponentVersionsWithRelations = async () => {
      try {
        const res = await infraComponentVersionService().retrieve()
        infraComponentVersions.value = res.data

        // Enrichir chaque infraComponentVersion avec les données complètes de infraComponent
        for (const icv of infraComponentVersions.value) {
          if (icv.infraComponent && icv.infraComponent.id && !icv.infraComponent.name) {
            // Si on a seulement l'ID, récupérer les données complètes
            try {
              const infraComponentRes = await infraComponentService().find(icv.infraComponent.id)
              icv.infraComponent = infraComponentRes
            } catch (error) {
              console.warn(`Could not fetch infraComponent ${icv.infraComponent.id}:`, error)
            }
          }
        }
      } catch (err) {
        alertService.showHttpError(err.response)
      }
    }

    // Quand un module est sélectionné, charger ses versions
    const onModuleChange = () => {
      selectedVersionId.value = ""
      if (selectedModuleId.value) {
        availableVersionsForSelectedModule.value = moduleVersions.value.filter(
          (version) => version.module && version.module.id === Number.parseInt(selectedModuleId.value),
        )
      } else {
        availableVersionsForSelectedModule.value = []
      }
    }

    // Ajouter le module et version sélectionnés
    const addModuleVersionToDetail = () => {
      if (!selectedModuleId.value || !selectedVersionId.value) return

      const moduleVersion = moduleVersions.value.find((mv) => mv.id === Number.parseInt(selectedVersionId.value))
      if (moduleVersion) {
        const exists = selectedAllowedModuleVersions.value.some((mv) => mv.id === moduleVersion.id)
        if (!exists) {
          selectedAllowedModuleVersions.value.push(moduleVersion)
        }
        // Réinitialiser les sélections
        selectedModuleId.value = ""
        selectedVersionId.value = ""
        availableVersionsForSelectedModule.value = []
      }
    }

    // Fonctions pour les modules
    const openModuleSettingsBase = async (detail) => {
      selectedDetail.value = detail
      selectedAllowedModuleVersions.value = detail.allowedModuleVersions || []

      // Charger les modules si pas encore fait
      if (allModules.value.length === 0) {
        await retrieveAllModules()
      } else {
        filterModulesByProduct()
      }

      showModuleSettingsModal.value = true
    }

    // Fonctions pour les popups d'information
    const viewDetailInfo = (detail) => {
      selectedDetailInfo.value = detail
      showDetailInfoModal.value = true
    }

    const closeDetailInfoModal = () => {
      showDetailInfoModal.value = false
      selectedDetailInfo.value = null
    }

    const viewInfraComponentInfo = (infraComponent) => {
      selectedInfraInfo.value = infraComponent
      showInfraInfoModal.value = true
    }

    const closeInfraInfoModal = () => {
      showInfraInfoModal.value = false
      selectedInfraInfo.value = null
    }

    // Récupérer les modules versions depuis le productVersion sélectionné et les enrichir
    const getModuleVersionsForSelectedProduct = () => {
      if (!selectedDetail.value || !selectedDetail.value.productVersion) {
        console.log("Pas de détail ou de productVersion sélectionné")
        return []
      }

      console.log("ProductVersion sélectionné:", selectedDetail.value.productVersion)

      // Vérifier si le productVersion a des moduleVersions
      if (
        !selectedDetail.value.productVersion.moduleVersions ||
        selectedDetail.value.productVersion.moduleVersions.length === 0
      ) {
        console.log("Aucun moduleVersions trouvé dans productVersion, recherche directe...")

        // Si le productVersion n'a pas de moduleVersions, chercher dans tous les moduleVersions
        // ceux qui sont associés à ce productVersion
        return moduleVersions.value
          .filter((mv) => {
            return mv.productVersion && mv.productVersion.id === selectedDetail.value.productVersion.id
          })
          .map((mv) => {
            // S'assurer que le module est bien présent
            if (!mv.module || !mv.module.name) {
              // Essayer de trouver le module correspondant
              const moduleId = mv.moduleId || (mv.module && mv.module.id)
              if (moduleId) {
                const fullModule = allModules.value.find((m) => m.id === moduleId)
                if (fullModule) {
                  mv.module = fullModule
                }
              }
            }
            return mv
          })
          .filter((mv) => mv.module && mv.module.name) // Filtrer ceux qui ont un nom de module
      }

      console.log(
        "ModuleVersions trouvés dans productVersion:",
        selectedDetail.value.productVersion.moduleVersions.length,
      )

      // Si le productVersion a des moduleVersions, les utiliser
      return selectedDetail.value.productVersion.moduleVersions
        .map((mv) => {
          // Trouver le module complet dans moduleVersions (qui contient les données complètes)
          const fullModuleVersion = moduleVersions.value.find((fullMv) => fullMv.id === mv.id)

          if (fullModuleVersion) {
            return {
              ...fullModuleVersion,
              // S'assurer que le module est bien présent
              module: fullModuleVersion.module || mv.module,
            }
          }

          // Si on ne trouve pas dans le cache, essayer d'enrichir avec les données disponibles
          if (!mv.module || !mv.module.name) {
            // Essayer de trouver le module correspondant
            const moduleId = mv.moduleId || (mv.module && mv.module.id)
            if (moduleId) {
              const fullModule = allModules.value.find((m) => m.id === moduleId)
              if (fullModule) {
                mv.module = fullModule
              }
            }
          }

          return mv
        })
        .filter((mv) => mv.module && mv.module.name) // Filtrer ceux qui ont un nom de module
    }

    // Ajouter cette fonction pour charger les modules versions pour un productVersion spécifique
    const loadModuleVersionsForProductVersion = async (productVersionId) => {
      if (!productVersionId) return []

      try {
        console.log("Chargement des modules versions pour productVersion:", productVersionId)

        // Récupérer la version du produit complète avec ses relations
        const productVersionResponse = await productVersionService().find(productVersionId)

        if (productVersionResponse && selectedDetail.value) {
          // Mettre à jour le productVersion dans le détail sélectionné avec la version complète
          selectedDetail.value.productVersion = productVersionResponse

          console.log("ProductVersion chargé avec ses relations:", productVersionResponse)

          // Si le productVersion a des moduleVersions, les utiliser directement
          if (productVersionResponse.moduleVersions && productVersionResponse.moduleVersions.length > 0) {
            console.log("ModuleVersions trouvés dans la réponse:", productVersionResponse.moduleVersions.length)
            return productVersionResponse.moduleVersions
          }
        }

        // Si on n'a pas trouvé de moduleVersions dans le productVersion,
        // chercher tous les moduleVersions qui sont associés à ce productVersion
        const moduleVersionsResponse = await moduleVersionService().retrieve()
        const filteredModuleVersions = moduleVersionsResponse.data.filter(
          (mv) => mv.productVersion && mv.productVersion.id === productVersionId,
        )

        console.log("ModuleVersions filtrés par productVersion:", filteredModuleVersions.length)

        // Enrichir les moduleVersions avec leurs modules
        for (const mv of filteredModuleVersions) {
          if (mv.moduleId && (!mv.module || !mv.module.name)) {
            try {
              const moduleResponse = await moduleService().find(mv.moduleId)
              mv.module = moduleResponse
            } catch (error) {
              console.warn(`Impossible de charger le module ${mv.moduleId}:`, error)
            }
          }
        }

        return filteredModuleVersions
      } catch (error) {
        console.error("Erreur lors du chargement des modules versions:", error)
        alertService.showHttpError(error.response)
        return []
      }
    }

    // Modifier la fonction openModuleSettings pour charger les modules versions
    const openModuleSettings = async (detail) => {
      selectedDetail.value = detail
      selectedAllowedModuleVersions.value = detail.allowedModuleVersions || []

      try {
        // Charger les modules versions pour le productVersion sélectionné
        if (detail.productVersion && detail.productVersion.id) {
          await loadModuleVersionsForProductVersion(detail.productVersion.id)

          // Rafraîchir la liste des modules versions disponibles
          const availableModules = getModuleVersionsForSelectedProduct()
          console.log("Modules versions disponibles:", availableModules.length)

          if (availableModules.length === 0) {
            alertService.showAlert("Aucun module version disponible pour cette version de produit.", "warning")
          }
        } else {
          alertService.showAlert("Aucune version de produit sélectionnée.", "warning")
        }
      } catch (error) {
        console.error("Erreur lors de l'ouverture des paramètres de module:", error)
        alertService.showHttpError(error.response)
      }

      showModuleSettingsModal.value = true
    }

    // Récupérer les infraComponentVersions depuis le productVersion sélectionné et les enrichir
    const getInfraComponentVersionsForSelectedProduct = () => {
      // Trouver la version du produit correspondant au déploiement sélectionné
      const productVersion = productVersions.value.find(
        (pv) => pv.product && pv.product.id === selectedProductDeployment.value?.productId,
      )

      if (!productVersion || !productVersion.infraComponentVersions) {
        return []
      }

      // Enrichir chaque infraComponentVersion avec les données complètes
      return productVersion.infraComponentVersions
        .map((icv) => {
          // Trouver la version complète dans infraComponentVersions (cache global)
          const fullInfraComponentVersion = infraComponentVersions.value.find((fullIcv) => fullIcv.id === icv.id)

          if (fullInfraComponentVersion && fullInfraComponentVersion.infraComponent) {
            return fullInfraComponentVersion
          }

          // Si pas trouvé dans le cache, essayer de construire à partir des données disponibles
          return {
            ...icv,
            infraComponent: icv.infraComponent || null,
          }
        })
        .filter((icv) => icv.infraComponent && icv.infraComponent.name) // Filtrer ceux qui ont un nom
    }

    const getModuleVersionById = (id) => {
      // Utiliser la fonction enrichie pour récupérer les modules
      const availableModules = getModuleVersionsForSelectedProduct()
      return availableModules.find((version) => version.id === Number.parseInt(id))
    }

    const addModuleToDetail = () => {
      if (!selectedModuleVersionId.value) return

      const moduleVersion = getModuleVersionById(selectedModuleVersionId.value)
      if (moduleVersion) {
        const exists = selectedAllowedModuleVersions.value.some((mv) => mv.id === moduleVersion.id)
        if (!exists) {
          selectedAllowedModuleVersions.value.push(moduleVersion)
        }
        selectedModuleVersionId.value = ""
      }
    }

    const removeModuleFromDetail = (index) => {
      selectedAllowedModuleVersions.value.splice(index, 1)
    }

    const saveModuleSettingsAndCreateDeployments = async () => {
      try {
        if (selectedDetail.value) {
          selectedDetail.value.allowedModuleVersions = [...selectedAllowedModuleVersions.value]
          await productDeployementDetailService().update(selectedDetail.value)

          // Créer automatiquement les modules de déploiement
          for (let i = 0; i < selectedAllowedModuleVersions.value.length; i++) {
            const moduleVersion = selectedAllowedModuleVersions.value[i]
            const code = `MD ${i + 1}`

            const newModuleDeployement = {
              code: code,
              notes: `Module déployé: ${moduleVersion.module?.name}`,
              createDate: new Date().toISOString().split("T")[0],
              moduleVersion: moduleVersion,
              productDeployementDetail: selectedDetail.value,
            }

            await moduleDeployementService().create(newModuleDeployement)
          }

          alertService.showInfo("Modules autorisés configurés et déploiements créés avec succès", {
            variant: "success",
          })
        }
        closeModuleSettingsModal()
      } catch (error) {
        alertService.showHttpError(error.response)
      }
    }

    const closeModuleSettingsModal = () => {
      showModuleSettingsModal.value = false
      selectedDetail.value = null
      selectedAllowedModuleVersions.value = []
    }

    // Fonction pour formater les dates
    const formatDate = (dateString) => {
      if (!dateString) return "Non définie"
      const date = new Date(dateString)
      return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    }

    // Watchers
    watch(
      productDeployments,
      () => {
        updateTotalItems()
        if (currentPage.value > totalPages.value && totalPages.value > 0) {
          currentPage.value = totalPages.value
        }
      },
      { deep: true },
    )

    watch(
      productDeployementDetails,
      () => {
        updateDetailTotalItems()
        if (detailCurrentPage.value > detailTotalPages.value && detailTotalPages.value > 0) {
          detailCurrentPage.value = detailTotalPages.value
        }
      },
      { deep: true },
    )

    onMounted(async () => {
      await retrieveClients()
      await retrieveProducts()
      await retrieveProductDeployments()
    })

    return {
      // État principal
      viewMode,
      showAddRow,
      newProductDeployment,
      cancelNewProductDeployment,
      saveNewProductDeployment,
      productDeployments,
      clients,
      products,
      handleSyncList,
      isFetching,
      retrieveProductDeployments,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeProductDeployment,
      editProductDeployment,
      saveProductDeployment,
      cancelEdit,
      t$,
      currentPage,
      itemsPerPage,
      totalItems,
      paginatedProductDeployments,
      totalPages,
      isPrevDisabled,
      isNextDisabled,
      paginationInfo,
      goToNextPage,
      goToPrevPage,
      searchTerm,
      handleSearch,

      // Nouvelles fonctions pour le design modifié
      selectedProductDeployment,
      toggleProductDeploymentSelection,
      returnToProductDeploymentList,
      loadDeploymentDetails,

      // État des détails
      productDeployementDetails,
      deployementTypes,
      productVersions,
      moduleVersions,
      showAddDetailRow,
      newProductDeployementDetail,
      detailCurrentPage,
      detailItemsPerPage,
      detailTotalItems,
      paginatedProductDeployementDetails,
      detailTotalPages,
      isDetailPrevDisabled,
      isDetailNextDisabled,
      detailPaginationInfo,
      detailSearchTerm,

      // Fonctions des détails
      goToDetailNextPage,
      goToDetailPrevPage,
      handleDetailSearch,
      saveNewProductDeployementDetail,
      cancelNewProductDeployementDetail,
      editProductDeployementDetail,
      saveProductDeployementDetail,
      cancelEditDetail,
      prepareRemoveDetail,
      closeDetailDialog,
      removeProductDeployementDetail,
      removeDetailId,
      removeDetailEntity,
      getFilteredProductVersions,

      // Modules
      showModuleSettingsModal,
      selectedDetail,
      selectedModuleVersionId,
      selectedAllowedModuleVersions,
      openModuleSettings,
      closeModuleSettingsModal,
      getModuleVersionById,
      addModuleToDetail,
      removeModuleFromDetail,
      saveModuleSettingsAndCreateDeployments,

      // Filtres
      selectedClientFilter,
      selectedProductFilter,
      applyFilters,
      resetFilters,

      // Nouvelles variables pour les onglets
      activeTab,

      // Nouvelles variables pour les popups
      showDetailInfoModal,
      selectedDetailInfo,
      showInfraInfoModal,
      selectedInfraInfo,
      viewDetailInfo,
      closeDetailInfoModal,
      viewInfraComponentInfo,
      closeInfraInfoModal,

      // Variables pour l'infrastructure
      infraComponentVersions,

      // Modules modifiés
      retrieveInfraComponentVersionsWithRelations,

      // Nouvelles variables pour les modules
      selectedModuleId,
      selectedVersionId,
      filteredModules,
      availableVersionsForSelectedModule,
      onModuleChange,
      addModuleVersionToDetail,

      // Nouvelles fonctions
      formatDate,
      getModuleVersionsForSelectedProduct,
      getInfraComponentVersionsForSelectedProduct,
    }
  },
})
