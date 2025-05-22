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
// Ajouter ces imports pour les modules de déploiement
import ModuleDeployementService from "../module-deployement/module-deployement.service"
import ModuleVersionService from "../module-version/module-version.service"
import type { IModuleDeployement } from "@/shared/model/module-deployement.model"
// Import pour les composants d'infrastructure
import InfraComponentVersionService from "../infra-component-version/infra-component-version.service"
import type { IInfraComponentVersion } from "@/shared/model/infra-component-version.model"

export default defineComponent({
  computed: {
    // Declare the variables here
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
    // Ajouter ces services
    const moduleDeployementService = inject("moduleDeployementService", () => new ModuleDeployementService())
    const moduleVersionService = inject("moduleVersionService", () => new ModuleVersionService())
    // Service pour les composants d'infrastructure
    const infraComponentVersionService = inject("infraComponentVersionService", () => new InfraComponentVersionService())

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

    // État pour la sélection et les onglets
    const selectedDetails = ref<IProductDeployementDetail[]>([])
    const activeTab = ref("productDeployement") // Changé pour correspondre à la vue
    const showTabs = ref(false)

    // Variables pour le modal de configuration des détails
    const showDetailSettingsModal = ref(false)
    const selectedDetailInfraComponentId = ref('')
    const detailInfraComponents = ref([])
    const infraComponentVersionOptions: Ref<IInfraComponentVersion[]> = ref([])
    const selectedDetail = ref(null)

    // Ajouter ces variables dans la section setup() du composant
    const showModuleSettingsModal = ref(false)
    const selectedModuleVersionId = ref('')
    const selectedAllowedModuleVersions = ref([])

    const filtredModulesVersion = ref([])

    // Computed properties pour la sélection
    const hasSelection = computed(() => selectedDetails.value.length > 0)

    // Méthode pour gérer les changements de checkbox
    const handleCheckboxChange = (detail: IProductDeployementDetail) => {
      // Vérifier si le détail est déjà sélectionné
      const isSelected = detail.isSelected

      if (isSelected) {
        // Ajouter à la sélection s'il n'y est pas déjà
        const exists = selectedDetails.value.some((d) => d.id === detail.id)
        if (!exists) {
          selectedDetails.value.push(detail)
        }
      } else {
        // Retirer de la sélection
        selectedDetails.value = selectedDetails.value.filter((d) => d.id !== detail.id)
      }

      // Mettre à jour l'affichage des onglets
      showTabs.value = selectedDetails.value.length > 0

      // Si on a des détails sélectionnés et qu'on est sur l'onglet modulesDeployement, charger les modules
      if (selectedDetails.value.length > 0 && activeTab.value === 'modulesDeployement') {
        retrieveModuleDeployementsBySelectedDetails()
      }
    }

    // Méthode pour effacer la sélection
    const clearSelection = () => {
      // Réinitialiser l'état isSelected pour tous les détails
      productDeployementDetails.value.forEach((d) => {
        d.isSelected = false
      })

      // Vider le tableau des détails sélectionnés
      selectedDetails.value = []

      // Masquer les onglets
      showTabs.value = false

      // Vider les modules de déploiement
      filteredModuleDeployements.value = []
    }

    const newProductDeployment = ref({
      refContract: "",
      createDate: new Date().toISOString().split("T")[0],
      updateDate: new Date().toISOString().split("T")[0],
      notes: "",
      client: null,
      product: null,
    })

    // État pour les détails
    const selectedProductDeployment = ref(null)
    const productDeployementDetails: Ref<IProductDeployementDetail[]> = ref([])
    const allProductDeployementDetails = ref([])
    const deployementTypes = ref([])
    const productVersions = ref([])
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
      isSelected: false, // Ajout de la propriété isSelected
    })

    // État pour les modules de déploiement
    const moduleDeployements: Ref<IModuleDeployement[]> = ref([])
    const filteredModuleDeployements: Ref<IModuleDeployement[]> = ref([])
    const moduleVersions = ref([])
    const showAddModuleDeployementRow = ref(false)
    const removeModuleDeployementId = ref(null)
    const removeModuleDeployementEntity = ref<any>(null)

    // Nouveau module de déploiement
    const newModuleDeployement = ref({
      code: "",
      notes: "",
      createDate: new Date().toISOString().split("T")[0],
      moduleVersion: null,
      productDeployementDetail: null
    })

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
    const productDeployementInfo = computed(() => {
      if (selectedProductDeployment.value) {
        return `${selectedProductDeployment.value.product?.name} (Client: ${selectedProductDeployment.value.client?.name || "N/A"})`
      }
      return ""
    })

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
      // Réinitialiser d'abord avec tous les déploiements
      productDeployments.value = [...allProductDeployments.value]

      // Appliquer le filtre de recherche textuelle si présent
      if (searchTerm.value.trim() !== "") {
        const searchLower = searchTerm.value.toLowerCase()
        productDeployments.value = productDeployments.value.filter((pd) => {
          return (
            (pd.refContract && pd.refContract.toLowerCase().includes(searchLower)) ||
            (pd.notes && pd.notes.toLowerCase().includes(searchLower)) ||
            (pd.client && pd.client.code && pd.client.code.toLowerCase().includes(searchLower))
          )
        })
      }

      // Appliquer le filtre client si sélectionné
      if (selectedClientFilter.value) {
        productDeployments.value = productDeployments.value.filter(
          pd => pd.client && pd.client.id === selectedClientFilter.value.id
        )
      }

      // Appliquer le filtre produit si sélectionné
      if (selectedProductFilter.value) {
        productDeployments.value = productDeployments.value.filter(
          pd => (pd.product && pd.product.id === selectedProductFilter.value.id) ||
            (pd.productId === selectedProductFilter.value.id)
        )
      }

      // Mettre à jour le total et réinitialiser la pagination
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

    const clear = () => {
      resetFilters()
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

        // Ajouter le nom du produit à chaque déploiement
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


// Ajouter cette fonction dans la section "setup" de votre composant
    const selectDetail = (detail) => {
      // Inverser l'état de sélection du détail
      detail.isSelected = !detail.isSelected;

      // Si le détail est maintenant sélectionné, l'ajouter à la liste des détails sélectionnés
      if (detail.isSelected) {
        // Vérifier s'il n'est pas déjà dans la liste
        const exists = selectedDetails.value.some((d) => d.id === detail.id);
        if (!exists) {
          selectedDetails.value.push(detail);
        }
      } else {
        // Sinon, le retirer de la liste
        selectedDetails.value = selectedDetails.value.filter((d) => d.id !== detail.id);
      }

      // Mettre à jour l'affichage des onglets
      showTabs.value = selectedDetails.value.length > 0;

      // Si on a des détails sélectionnés et qu'on est sur l'onglet modulesDeployement, charger les modules
      if (selectedDetails.value.length > 0) {
        // Définir l'onglet par défaut sur "modulesDeployement"
        activeTab.value = 'modulesDeployement';

        // Charger les modules de déploiement pour les détails sélectionnés
        retrieveModuleDeployementsBySelectedDetails();
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
      productDeployments.value.forEach((pd) => (pd.showDropdown = false))
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
      productDeployments.value.forEach((pd) => (pd.showDropdown = false))
      productDeployment.originalData = JSON.parse(
        JSON.stringify({
          refContract: productDeployment.refContract,
          createDate: productDeployment.createDate,
          updateDate: productDeployment.updateDate,
          notes: productDeployment.notes,
          client: productDeployment.client ? {...productDeployment.client} : null,
          product: productDeployment.product ? {...productDeployment.product} : null,
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
        ? {...productDeployment.originalData.client}
        : null
      productDeployment.product = productDeployment.originalData.product
        ? {...productDeployment.originalData.product}
        : null
      productDeployment.isEditing = false
    }

    const toggleDropdown = (productDeployment) => {
      productDeployments.value.forEach((pd) => {
        if (pd.id !== productDeployment.id) pd.showDropdown = false
      })
      productDeployment.showDropdown = !productDeployment.showDropdown
    }

    // Fonctions pour les détails
    const formatDate = (dateString) => {
      if (!dateString) return ""
      const date = new Date(dateString)
      return date.toLocaleDateString("fr-FR")
    }

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

    // Remplacer la fonction findDetailsByProductDeployementId par celle-ci:
    const findDetailsByProductDeployementId = async (id) => {
      try {
        // Récupérer tous les détails
        const response = await productDeployementDetailService().retrieve()

        // Filtrer les détails qui correspondent au déploiement sélectionné
        const filteredDetails = response.data.filter(
          (detail) => detail.productDeployement && detail.productDeployement.id === id,
        )

        console.log(`Détails filtrés pour le déploiement ${id}:`, filteredDetails)

        // Retourner un objet avec la même structure que la réponse d'axios
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

    // Modifiez retrieveProductDeployementDetails pour réinitialiser la sélection
    const retrieveProductDeployementDetails = async () => {
      try {
        if (selectedProductDeployment.value) {
          const res = await findDetailsByProductDeployementId(selectedProductDeployment.value.id)
          productDeployementDetails.value = res.data.map(
            (detail) =>
              ({
                ...detail,
                isSelected: false, // Initialisation explicite
                isEditing: false,
                originalData: JSON.parse(JSON.stringify(detail)),
              }) as IProductDeployementDetail,
          ) // Cast explicite

          // Réinitialiser la sélection
          selectedDetails.value = []
          showTabs.value = false

          // Mettre à jour allProductDeployementDetails
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
        // Récupérer toutes les versions
        const allVersions = res.data

        // Si un déploiement est sélectionné et qu'il a un produit associé
        if (selectedProductDeployment.value && selectedProductDeployment.value.productId) {
          // Filtrer les versions pour ne garder que celles du produit concerné
          productVersions.value = allVersions.filter(
            (version) => version.product && version.product.id === selectedProductDeployment.value.productId,
          )

          console.log(
            `Versions filtrées pour le produit ${selectedProductDeployment.value.productId}:`,
            productVersions.value,
          )
        } else {
          // Si pas de produit spécifique, garder toutes les versions
          productVersions.value = allVersions
        }
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

        // Retirer le détail de la sélection si nécessaire
        selectedDetails.value = selectedDetails.value.filter((detail) => detail.id !== removeDetailId.value)
        showTabs.value = selectedDetails.value.length > 0

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
      if (!newProductDeployementDetail.value.startDeployementDate) {
        alertService.showAlert("Le champ date de début est requis.", "danger")
        return
      }

      if (!newProductDeployementDetail.value.deployementType) {
        alertService.showAlert("Le champ type de déploiement est requis.", "danger")
        return
      }

      if (!newProductDeployementDetail.value.productVersion) {
        alertService.showAlert("Le champ version du produit est requis.", "danger")
        return
      }

      try {
        // Assurez-vous que le productDeployement est défini
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
      if (!detail.startDeployementDate) {
        alertService.showAlert("Le champ date de début est requis.", "danger")
        return
      }

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
          isSelected: detail.isSelected, // Conserver l'état de sélection
          isEditing: false,
          originalData: null,
        }

        const index = productDeployementDetails.value.findIndex((d) => d.id === detail.id)
        if (index !== -1) productDeployementDetails.value.splice(index, 1, updated)

        const allIndex = allProductDeployementDetails.value.findIndex((d) => d.id === detail.id)
        if (allIndex !== -1) allProductDeployementDetails.value.splice(allIndex, 1, updated)

        // Mettre à jour la sélection si nécessaire
        if (detail.isSelected) {
          const selIndex = selectedDetails.value.findIndex((d) => d.id === detail.id)
          if (selIndex !== -1) selectedDetails.value.splice(selIndex, 1, updated)
        }

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

    // Fonctions pour les modules de déploiement
    const retrieveAllModuleDeployements = async () => {
      try {
        const res = await moduleDeployementService().retrieve()
        moduleDeployements.value = res.data.map(md => ({
          ...md,
          isEditing: false,
          originalData: JSON.parse(JSON.stringify(md))
        }))
        console.log("Tous les modules de déploiement récupérés:", moduleDeployements.value)
      } catch (err) {
        alertService.showHttpError(err.response)
      }
    }

    const retrieveModuleVersions = async () => {
      try {
        const res = await moduleVersionService().retrieve()
        moduleVersions.value = res.data
        console.log("Versions de modules récupérées:", moduleVersions.value)
      } catch (err) {
        alertService.showHttpError(err.response)
      }
    }

    const modulesVersionFilter = () => {
      const filtredModulesVersion = selectedDetail.productVersion?.moduleVersions.value;
      console.log("Filtred modules version:", selectedDetail.productVersion?.moduleVersions.value);
    }

    const retrieveModuleDeployementsBySelectedDetails = async () => {
      if (selectedDetails.value.length === 0) {
        filteredModuleDeployements.value = []
        return
      }

      try {
        // S'assurer que tous les modules sont chargés
        if (moduleDeployements.value.length === 0) {
          await retrieveAllModuleDeployements()
        }

        // Récupérer les IDs des détails sélectionnés
        const selectedDetailIds = selectedDetails.value.map(detail => detail.id)

        // Filtrer les modules qui correspondent aux détails sélectionnés
        filteredModuleDeployements.value = moduleDeployements.value.filter(
          module => module.productDeployementDetail && selectedDetailIds.includes(module.productDeployementDetail.id)
        )

        console.log("Modules filtrés pour les détails sélectionnés:", filteredModuleDeployements.value)
      } catch (err) {
        alertService.showHttpError(err.response)
      }
    }

    const saveNewModuleDeployement = async () => {
      if (!newModuleDeployement.value.code) {
        alertService.showAlert("Le champ code est requis.", "danger")
        return
      }

      if (!newModuleDeployement.value.moduleVersion) {
        alertService.showAlert("Le champ version du module est requis.", "danger")
        return
      }

      if (selectedDetails.value.length === 0) {
        alertService.showAlert("Veuillez sélectionner au moins un détail de déploiement.", "danger")
        return
      }

      try {
        // Utiliser le premier détail sélectionné comme référence
        newModuleDeployement.value.productDeployementDetail = selectedDetails.value[0]

        const response = await moduleDeployementService().create(newModuleDeployement.value)
        const added = {
          ...response,
          isEditing: false,
          originalData: JSON.parse(JSON.stringify(response))
        }

        moduleDeployements.value.push(added)
        filteredModuleDeployements.value.push(added)

        showAddModuleDeployementRow.value = false
        newModuleDeployement.value = {
          code: "",
          notes: "",
          createDate: new Date().toISOString().split("T")[0],
          moduleVersion: null,
          productDeployementDetail: null
        }

        alertService.showAlert("Module de déploiement ajouté avec succès.", "success", { variant: "success" })
      } catch (error) {
        alertService.showHttpError(error.response)
      }
    }

    const cancelNewModuleDeployement = () => {
      showAddModuleDeployementRow.value = false
      newModuleDeployement.value = {
        code: "",
        notes: "",
        createDate: new Date().toISOString().split("T")[0],
        moduleVersion: null,
        productDeployementDetail: null
      }
    }

    const editModuleDeployement = (moduleDeployement) => {
      moduleDeployement.originalData = JSON.parse(JSON.stringify({
        code: moduleDeployement.code,
        notes: moduleDeployement.notes,
        createDate: moduleDeployement.createDate,
        moduleVersion: moduleDeployement.moduleVersion
      }))
      moduleDeployement.isEditing = true
    }

    const saveModuleDeployement = async (moduleDeployement) => {
      if (!moduleDeployement.code) {
        alertService.showAlert("Le champ code est requis.", "danger")
        return
      }

      if (!moduleDeployement.moduleVersion) {
        alertService.showAlert("Le champ version du module est requis.", "danger")
        return
      }

      try {
        const response = await moduleDeployementService().update(moduleDeployement)
        const updated = {
          ...response,
          isEditing: false,
          originalData: null
        }

        // Mettre à jour dans la liste complète
        const index = moduleDeployements.value.findIndex(md => md.id === moduleDeployement.id)
        if (index !== -1) moduleDeployements.value.splice(index, 1, updated)

        // Mettre à jour dans la liste filtrée
        const filteredIndex = filteredModuleDeployements.value.findIndex(md => md.id === moduleDeployement.id)
        if (filteredIndex !== -1) filteredModuleDeployements.value.splice(filteredIndex, 1, updated)

        alertService.showAlert("Module de déploiement mis à jour avec succès.", "success", { variant: "success" })
      } catch (error) {
        alertService.showHttpError(error.response)
      }
    }

    const cancelEditModuleDeployement = (moduleDeployement) => {
      moduleDeployement.code = moduleDeployement.originalData.code
      moduleDeployement.notes = moduleDeployement.originalData.notes
      moduleDeployement.createDate = moduleDeployement.originalData.createDate
      moduleDeployement.moduleVersion = moduleDeployement.originalData.moduleVersion
      moduleDeployement.isEditing = false
    }

    const prepareRemoveModuleDeployement = (moduleDeployement) => {
      removeModuleDeployementId.value = moduleDeployement.id
      removeModuleDeployementEntity.value.show()
    }

    const closeModuleDeployementDialog = () => removeModuleDeployementEntity.value.hide()

    const removeModuleDeployement = async () => {
      try {
        await moduleDeployementService().delete(removeModuleDeployementId.value)
        alertService.showInfo("Module de déploiement supprimé avec succès", { variant: "success" })

        // Retirer de la liste complète
        moduleDeployements.value = moduleDeployements.value.filter(
          md => md.id !== removeModuleDeployementId.value
        )

        // Retirer de la liste filtrée
        filteredModuleDeployements.value = filteredModuleDeployements.value.filter(
          md => md.id !== removeModuleDeployementId.value
        )

        removeModuleDeployementId.value = null
        closeModuleDeployementDialog()
      } catch (error) {
        alertService.showHttpError(error.response)
      }
    }

    // Fonctions pour les composants d'infrastructure
    const fetchInfraComponentVersionOptions = async () => {
      try {
        const res = await infraComponentVersionService().retrieve()
        infraComponentVersionOptions.value = res.data
        console.log("Versions de composants d'infrastructure récupérées:", infraComponentVersionOptions.value)
      } catch (err) {
        console.error('Erreur lors de la récupération des versions de composants d\'infrastructure:', err)
        alertService.showHttpError(err.response)
      }
    }

    const openDetailSettings = (detail) => {
      selectedDetail.value = detail
      detailInfraComponents.value = detail.infraComponentVersions || []
      showDetailSettingsModal.value = true
    }

    const closeDetailSettingsModal = () => {
      showDetailSettingsModal.value = false
      selectedDetailInfraComponentId.value = ''
      selectedDetail.value = null
    }

    const saveDetailSettingsModal = async () => {
      try {
        if (selectedDetail.value) {
          // Mettre à jour le détail avec les composants d'infrastructure sélectionnés
          selectedDetail.value.infraComponentVersions = detailInfraComponents.value

          // Appeler l'API pour sauvegarder les modifications
          await productDeployementDetailService().update(selectedDetail.value)

          // Rafraîchir les détails
          if (selectedProductDeployment.value) {
            await retrieveProductDeployementDetails()
          }

          alertService.showInfo('Configuration sauvegardée avec succès', { variant: 'success' })
        }
        closeDetailSettingsModal()
      } catch (error) {
        alertService.showHttpError(error.response)
      }
    }

    const getInfraComponentById = (id) => {
      return infraComponentVersionOptions.value.find(component => component.id === Number.parseInt(id))
    }

    const addInfraToDetail = () => {
      if (!selectedDetailInfraComponentId.value) return

      const component = getInfraComponentById(selectedDetailInfraComponentId.value)
      if (component) {
        const exists = detailInfraComponents.value.some(c => c.id === component.id)
        if (!exists) {
          detailInfraComponents.value.push(component)
        }
        selectedDetailInfraComponentId.value = ''
      }
    }

    const removeInfraFromDetail = (index) => {
      detailInfraComponents.value.splice(index, 1)
    }

    // Fonction pour afficher les détails d'un déploiement
    // Remplacer la fonction viewProductDeploymentDetails par celle-ci:
    const viewProductDeploymentDetails = async (productDeployment) => {
      console.log("Affichage des détails pour le déploiement:", productDeployment.id)

      // Réinitialiser les détails avant de charger les nouveaux
      productDeployementDetails.value = []
      allProductDeployementDetails.value = []
      selectedDetails.value = []
      showTabs.value = false
      detailSearchTerm.value = ""
      detailCurrentPage.value = 1

      // Définir le déploiement sélectionné avec le productId
      selectedProductDeployment.value = {
        ...productDeployment,
        productId: productDeployment.product ? productDeployment.product.id : productDeployment.productId
      }

      // Initialiser le nouveau détail avec le productDeployement sélectionné
      newProductDeployementDetail.value.productDeployement = {
        id: productDeployment.id,
        refContract: productDeployment.refContract,
      }

      // Charger les données nécessaires
      await retrieveDeployementTypes()
      await retrieveProductVersions() // Cette fonction filtre maintenant les versions par produit
      await retrieveProductDeployementDetails()
      await retrieveModuleVersions()
      await retrieveAllModuleDeployements()
      await fetchInfraComponentVersionOptions() // Charger les composants d'infrastructure

      // Réinitialiser les onglets
      activeTab.value = "productDeployement"
      showTabs.value = false
    }

    // Fonction pour revenir à la liste des déploiements
    const goBackToList = () => {
      selectedProductDeployment.value = null
      productDeployementDetails.value = []
      allProductDeployementDetails.value = []
      selectedDetails.value = []
      showTabs.value = false
      detailSearchTerm.value = ""
      detailCurrentPage.value = 1
      filteredModuleDeployements.value = []
    }

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

    // Observer les changements dans selectedDetails pour mettre à jour showTabs
    watch(
      selectedDetails,
      (newVal) => {
        showTabs.value = newVal.length > 0
      },
      { deep: true },
    )

    // Observer les changements d'onglet pour charger les modules si nécessaire
    watch(
      activeTab,
      (newTab) => {
        if (newTab === 'modulesDeployement' && selectedDetails.value.length > 0) {
          retrieveModuleDeployementsBySelectedDetails()
        }
      }
    )

    onMounted(async () => {
      await retrieveClients()
      await retrieveProducts()
      await retrieveProductDeployments()
      await fetchInfraComponentVersionOptions() // Charger les composants d'infrastructure au démarrage
      document.addEventListener("click", (event) => {
        if (!event.target.closest(".dropdown-menu-container")) {
          productDeployments.value.forEach((pd) => (pd.showDropdown = false))
        }
      })
      modulesVersionFilter();
    })

    // Computed property pour vérifier si tous les détails sont sélectionnés
    const allDetailsSelected = computed(() => {
      return (
        productDeployementDetails.value.length > 0 &&
        productDeployementDetails.value.every((detail) => detail.isSelected)
      )
    })

    // Méthode pour sélectionner/désélectionner tous les détails
    const toggleAllDetails = (event) => {
      const isChecked = event.target.checked
      productDeployementDetails.value.forEach((detail) => {
        detail.isSelected = isChecked
        handleCheckboxChange(detail)
      })
    }

    // Ajouter ces fonctions dans la section setup() du composant
    const openModuleSettings = (detail) => {
      selectedDetail.value = detail
      selectedAllowedModuleVersions.value = detail.allowedModuleVersions || []
      showModuleSettingsModal.value = true
    }

    const closeModuleSettingsModal = () => {
      showModuleSettingsModal.value = false
      selectedModuleVersionId.value = ''
      selectedDetail.value = null
    }

    const getModuleVersionById = (id) => {
      return moduleVersions.value.find(version => version.id === Number.parseInt(id))
    }

    const addModuleToDetail = () => {
      if (!selectedModuleVersionId.value) return

      const moduleVersion = getModuleVersionById(selectedModuleVersionId.value)
      if (moduleVersion) {
        const exists = selectedAllowedModuleVersions.value.some(mv => mv.id === moduleVersion.id)
        if (!exists) {
          selectedAllowedModuleVersions.value.push(moduleVersion)
        }
        selectedModuleVersionId.value = ''
      }
    }

    const removeModuleFromDetail = (index) => {
      selectedAllowedModuleVersions.value.splice(index, 1)
    }

    const saveModuleSettingsAndCreateDeployments = async () => {
      try {
        if (selectedDetail.value) {
          // Mettre à jour le détail avec les modules autorisés sélectionnés
          selectedDetail.value.allowedModuleVersions = [...selectedAllowedModuleVersions.value]

          // Appeler l'API pour sauvegarder les modifications
          await productDeployementDetailService().update(selectedDetail.value)

          // Supprimer d'abord tous les modules de déploiement existants pour ce détail
          const existingModules = moduleDeployements.value.filter(
            md => md.productDeployementDetail && md.productDeployementDetail.id === selectedDetail.value.id
          )

          for (const module of existingModules) {
            await moduleDeployementService().delete(module.id)
            // Retirer de la liste des modules
            moduleDeployements.value = moduleDeployements.value.filter(md => md.id !== module.id)
          }

          // Créer automatiquement les modules de déploiement
          for (let i = 0; i < selectedAllowedModuleVersions.value.length; i++) {
            const moduleVersion = selectedAllowedModuleVersions.value[i]

            // Créer un code unique pour le module de déploiement (MD 1, MD 2, etc.)
            const code = `MD ${i + 1}`

            // Créer un nouveau module de déploiement
            const newModuleDeployement = {
              code: code,
              notes: `Module déployé: ${moduleVersion.module?.name}`,
              createDate: new Date().toISOString().split("T")[0],
              moduleVersion: moduleVersion,
              productDeployementDetail: selectedDetail.value
            }

            // Sauvegarder le nouveau module de déploiement
            const response = await moduleDeployementService().create(newModuleDeployement)

            // Ajouter à la liste des modules de déploiement
            moduleDeployements.value.push({
              ...response,
              isEditing: false,
              originalData: JSON.parse(JSON.stringify(response))
            })
          }

          // Rafraîchir les modules de déploiement
          await retrieveModuleDeployementsBySelectedDetails()

          // Sélectionner le détail pour afficher les modules dans l'onglet
          selectDetail(selectedDetail.value)

          alertService.showInfo('Modules autorisés configurés et déploiements créés avec succès', { variant: 'success' })
        }
        closeModuleSettingsModal()
      } catch (error) {
        alertService.showHttpError(error.response)
      }
    }

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
      toggleDropdown,
      clear,
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

      // État des détails
      selectedProductDeployment,
      productDeployementDetails,
      deployementTypes,
      productVersions,
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
      productDeployementInfo,

      // Fonctions des détails
      viewProductDeploymentDetails,
      goBackToList,
      formatDate,
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

      // Sélection et onglets
      selectedDetails,
      activeTab,
      showTabs,
      hasSelection,
      clearSelection,
      handleCheckboxChange,

      // Ajoutez ces nouvelles propriétés et méthodes
      allDetailsSelected,
      toggleAllDetails,
      getFilteredProductVersions,

      // Modules de déploiement
      moduleDeployements,
      filteredModuleDeployements,
      moduleVersions,
      showAddModuleDeployementRow,
      newModuleDeployement,
      saveNewModuleDeployement,
      cancelNewModuleDeployement,
      editModuleDeployement,
      saveModuleDeployement,
      cancelEditModuleDeployement,
      prepareRemoveModuleDeployement,
      closeModuleDeployementDialog,
      removeModuleDeployement,
      removeModuleDeployementId,
      removeModuleDeployementEntity,
      retrieveModuleDeployementsBySelectedDetails,
      selectedClientFilter,
      selectedProductFilter,
      applyFilters,
      resetFilters,

      // Composants d'infrastructure
      showDetailSettingsModal,
      selectedDetailInfraComponentId,
      detailInfraComponents,
      infraComponentVersionOptions,
      selectedDetail,
      openDetailSettings,
      closeDetailSettingsModal,
      saveDetailSettingsModal,
      getInfraComponentById,
      addInfraToDetail,
      removeInfraFromDetail,
      selectDetail,

      // ... autres propriétés existantes
      showModuleSettingsModal,
      selectedModuleVersionId,
      selectedAllowedModuleVersions,
      openModuleSettings,
      closeModuleSettingsModal,
      getModuleVersionById,
      addModuleToDetail,
      removeModuleFromDetail,
      saveModuleSettingsAndCreateDeployments,
      modulesVersionFilter,
    }
  },
})
