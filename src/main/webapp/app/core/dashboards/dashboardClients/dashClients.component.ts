import { defineComponent, inject, onMounted, ref, nextTick } from "vue"
import { useI18n } from "vue-i18n"
import { useAlertService } from "@/shared/alert/alert.service"
import Chart from "chart.js/auto"

// Import services and models
import ClientService from "@/entities/client/client.service"
import ProductDeployementService from "@/entities/product-deployement/product-deployement.service"
import ProductDeployementDetailService from "@/entities/product-deployement-detail/product-deployement-detail.service"
import RequestOfChangeService from "@/entities/request-of-change/request-of-change.service"
import ClientSizeService from "@/entities/client-size/client-size.service.ts"
import ClientTypeService from "@/entities/client-type/client-type.service.ts"
import CustomisationLevelService from "@/entities/customisation-level/customisation-level.service.ts"
import ProductVersionService from "@/entities/product-version/product-version.service.ts"
import ModuleVersionService from "@/entities/module-version/module-version.service.ts"
import ModuleService from "@/entities/module/module.service.ts"
import ModuleDeployementService from "@/entities/module-deployement/module-deployement.service.ts"

export default defineComponent({
  name: "DashClientsComponent",
  setup() {
    const productVersionService = inject("productVersionService", () => new ProductVersionService())
    const alertService = inject("alertService", () => useAlertService(), true)
    const { t } = useI18n()

    // Scroll refs
    const scrollContainer = ref(null)
    const isAtStart = ref(true)
    const isAtEnd = ref(false)

    // Data refs
    const clients = ref([])
    const loading = ref(true)

    // Charts related refs
    const selectedClient = ref(null)
    const clientProductDeployments = ref([])
    const productDeploymentsChart = ref(null)
    const requestChangesChart = ref(null)
    const clientsEvolutionChart = ref(null)

    const productDeploymentsChartInstance = ref(null)
    const requestChangesChartInstance = ref(null)
    const clientsEvolutionChartInstance = ref(null)

    // Initialiser correctement les données
    const productDeploymentsChartData = ref({ labels: [], datasets: [] })
    const requestChangesChartData = ref({ datasets: [] }) // Pas de labels pour scatter plot
    const clientsEvolutionData = ref({ labels: [], datasets: [] })
    const totalRequests = ref({ basic: 0, intermediate: 0, advanced: 0 })
    const currentYear = ref(new Date().getFullYear())

    // Contracts table functionality refs
    const contracts = ref([])
    const contractsLoading = ref(false)
    const expandedContracts = ref(new Set())
    const expandedDeploymentDetails = ref(new Set())

    // Module popup functionality refs
    const showModulePopup = ref(false)
    const selectedModuleData = ref(null)

    // Services
    const clientService = new ClientService()
    const moduleVersionService = new ModuleVersionService()
    const moduleService = new ModuleService()
    const productDeployementService = new ProductDeployementService()
    const productDeployementDetailService = new ProductDeployementDetailService()
    const requestOfChangeService = new RequestOfChangeService()
    const customisationLevelService = new CustomisationLevelService()
    const clientSizeService = inject("clientSizeService", () => new ClientSizeService())
    const clientTypeService = inject("clientTypeService", () => new ClientTypeService())
    const moduleDeployementService = new ModuleDeployementService()

    const fetchClients = async () => {
      try {
        loading.value = true
        const res = await clientService.retrieve()
        const clientsData = res.data

        clients.value = await Promise.all(
          clientsData.map(async (client, index) => {
            const deployments = await countClientDeployments(client.id)
            const products = await countClientProducts(client.id)
            const requestOfChanges = await countClientRequestOfChanges(client.id)

            if (client.size?.id) {
              try {
                client.size = await clientSizeService().find(client.size.id)
              } catch (sizeError) {
                console.error("Erreur de chargement du client size:", sizeError)
              }
            }

            if (client.clientType?.id) {
              try {
                client.clientType = await clientTypeService().find(client.clientType.id)
              } catch (typeError) {
                console.error("Erreur de chargement du client type:", typeError)
              }
            }

            return {
              id: client.id,
              name: client.name || "Unknown Client",
              type: client.clientType?.type,
              badgeClass: getClientBadgeClass(index),
              icon: "bi-building",
              products: products,
              requestsOfChanges: requestOfChanges,
              deployments: deployments,
            }
          }),
        )
      } catch (error) {
        console.error("Error fetching clients:", error)
        alertService.showHttpError(error.response || error)
      } finally {
        loading.value = false
      }
    }

    const loadClientsEvolutionData = async () => {
      try {
        // Récupérer tous les clients avec leurs dates de création
        const allClients = await clientService.retrieve()
        const clientsData = allClients.data || allClients

        // Filtrer les clients de l'année courante
        const currentYearClients = clientsData.filter((client) => {
          if (!client.createDate) return false
          const clientYear = new Date(client.createDate).getFullYear()
          return clientYear === currentYear.value
        })

        // Trier les clients par date de création
        currentYearClients.sort((a, b) => {
          return new Date(a.createDate).getTime() - new Date(b.createDate).getTime()
        })

        // Grouper par mois et calculer le cumul
        const monthlyCount = Array(12).fill(0)
        const cumulativeCount = Array(12).fill(0)
        const clientsByMonth = Array(12)
          .fill(null)
          .map(() => []) // Stocker les noms des clients
        const monthNames = ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

        // Compter les clients par mois et stocker leurs noms
        currentYearClients.forEach((client) => {
          const month = new Date(client.createDate).getMonth()
          monthlyCount[month]++
          clientsByMonth[month].push(client.name) // Stocker le nom du client
        })

        // Calculer le cumul
        let cumul = 0
        for (let i = 0; i < 12; i++) {
          cumul += monthlyCount[i]
          cumulativeCount[i] = cumul
        }

        // Créer les données du graphique
        clientsEvolutionData.value = {
          labels: monthNames,
          datasets: [
            {
              label: "Clients created per month",
              data: monthlyCount,
              backgroundColor: "rgba(12, 166, 120, 0.8)",
              borderColor: "rgba(12, 166, 120, 1)",
              borderWidth: 2,
              type: "bar",
              order: 2,
              clientNames: clientsByMonth, // Ajouter les noms des clients
            },
            {
              label: "Cumulative growth",
              data: cumulativeCount,
              backgroundColor: "rgba(12, 45, 87, 0.2)",
              borderColor: "rgba(12, 45, 87, 1)",
              borderWidth: 3,
              type: "line",
              fill: true,
              tension: 0.4,
              pointBackgroundColor: "rgba(12, 45, 87, 1)",
              pointBorderColor: "#ffffff",
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8,
              order: 1,
            },
          ],
        }
      } catch (error) {
        console.error("Error loading clients evolution data:", error)
        clientsEvolutionData.value = { labels: [], datasets: [] }
      }
    }

    const countClientDeployments = async (clientId) => {
      try {
        // Fetch all product deployments
        const res = await productDeployementService.retrieve()
        const deployments = res.data.filter((pd) => pd.client?.id === clientId)

        // If no deployments found, return 0
        if (!deployments.length) {
          return 0
        }

        // Fetch all product deployment details
        const productDeploymentDetailsRes = await productDeployementDetailService.retrieve()
        const allDetails = productDeploymentDetailsRes.data

        // Count details for all deployments
        const detailsCount = deployments.reduce((count, deployment) => {
          const deploymentDetails = allDetails.filter((detail) => detail.productDeployement?.id === deployment.id)
          return count + deploymentDetails.length
        }, 0)

        return detailsCount
      } catch (error) {
        console.error("Error counting client deployments:", error)
        throw error // Rethrow the error for upstream handling
      }
    }

    const countClientProducts = async (clientId) => {
      try {
        const res = await productDeployementService.retrieve()
        const deployments = res.data.filter((pd) => pd.client?.id === clientId)
        const uniqueProducts = new Set(deployments.map((pd) => pd.id))
        return uniqueProducts.size
      } catch (error) {
        console.error("Error counting client products:", error)
        return 0
      }
    }

    const countClientRequestOfChanges = async (clientId) => {
      try {
        const res = await requestOfChangeService.retrieve()
        const requestsOfChanges = res.data.filter((req) => req.client?.id === clientId)
        return requestsOfChanges.length
      } catch (error) {
        console.error("Error counting client RequestsOfChanges:", error)
        return 0
      }
    }

    const getClientBadgeClass = (index) => {
      const classes = ["finance", "insurance", "security", "analytics", "communication", "health", "logistics"]
      return classes[index % classes.length]
    }

    const selectClient = async (client) => {
      // D'abord détruire les graphiques existants
      destroyCharts()
      selectedClient.value = client
      await nextTick()
      // Charger les données
      await loadClientChartsData(client)
      await fetchContracts(client.id)
      // Attendre un peu puis créer les nouveaux graphiques
      setTimeout(() => {
        createCharts()
      }, 150)
    }

    const closeCharts = async () => {
      selectedClient.value = null
      contracts.value = []
      destroyCharts()
      await fetchClients()
      await loadClientsEvolutionData()
      createCharts()
    }

    const destroyCharts = () => {
      if (productDeploymentsChartInstance.value) {
        productDeploymentsChartInstance.value.destroy()
        productDeploymentsChartInstance.value = null
      }
      if (requestChangesChartInstance.value) {
        requestChangesChartInstance.value.destroy()
        requestChangesChartInstance.value = null
      }
      if (clientsEvolutionChartInstance.value) {
        clientsEvolutionChartInstance.value.destroy()
        clientsEvolutionChartInstance.value = null
      }
    }

    const loadClientChartsData = async (client) => {
      try {
        await loadClientTechnologyStackData(client.id)
        await loadRequestChangesScatterData(client.id)
      } catch (error) {
        console.error("Error loading client charts data:", error)
        alertService.showHttpError(error.response || error)
      }
    }

    const loadClientTechnologyStackData = async (clientId) => {
      try {
        // Get all product deployments for this client
        const productDeploymentsRes = await productDeployementService.retrieve()
        const clientDeployments = productDeploymentsRes.data.filter((pd) => pd.client?.id === clientId)

        if (clientDeployments.length === 0) {
          productDeploymentsChartData.value = { labels: [], datasets: [] }
          return
        }

        // Get all deployment details for client's deployments
        const productDeploymentDetailsRes = await productDeployementDetailService.retrieve()
        const clientDeploymentDetails = productDeploymentDetailsRes.data.filter((detail) =>
          clientDeployments.some((deployment) => deployment.id === detail.productDeployement?.id),
        )

        // Get all module deployments for client's deployment details
        const moduleDeploymentsRes = await moduleDeployementService.retrieve()
        const clientModuleDeployments = moduleDeploymentsRes.data.filter((moduleDeployment) =>
          clientDeploymentDetails.some((detail) => detail.id === moduleDeployment.productDeployementDetail?.id),
        )

        const deployedModulesMap = new Map()
        const moduleDetailsMap = new Map()

        for (const moduleDeployment of clientModuleDeployments) {
          if (moduleDeployment.moduleVersion?.id) {
            try {
              const moduleVersionRes = await moduleVersionService.find(moduleDeployment.moduleVersion.id)
              const moduleVersion = moduleVersionRes.data || moduleVersionRes

              if (moduleVersion.module?.id) {
                const moduleRes = await moduleService.find(moduleVersion.module.id)
                const module = moduleRes.data || moduleRes
                const moduleName = module.name || "Unknown Module"

                // Count deployments per module
                deployedModulesMap.set(moduleName, (deployedModulesMap.get(moduleName) || 0) + 1)

                // Store module details
                if (!moduleDetailsMap.has(moduleName)) {
                  moduleDetailsMap.set(moduleName, {
                    versions: new Set(),
                    deploymentDates: [],
                    description: module.description || "No description available",
                  })
                }

                const moduleDetails = moduleDetailsMap.get(moduleName)
                moduleDetails.versions.add(moduleVersion.version || "Unknown")

                // Find deployment detail date
                const relatedDetail = clientDeploymentDetails.find(
                  (detail) => detail.id === moduleDeployment.productDeployementDetail?.id,
                )
                if (relatedDetail?.startDeployementDate) {
                  moduleDetails.deploymentDates.push(relatedDetail.startDeployementDate)
                }
              }
            } catch (error) {
              console.error("Error fetching module details:", error)
            }
          }
        }

        if (deployedModulesMap.size === 0) {
          productDeploymentsChartData.value = { labels: [], datasets: [] }
          return
        }

        const sortedModules = Array.from(deployedModulesMap.entries())
          .sort((a, b) => b[1] - a[1]) // Sort by deployment count descending
          .slice(0, 10) // Limit to top 10 modules

        const labels = sortedModules.map(([moduleName]) => moduleName)
        const data = sortedModules.map(([, count]) => count)

        // Generate colors for each module
        const backgroundColors = labels.map((_, index) => {
          const hue = (index * 137.5) % 360 // Golden angle for good color distribution
          return `hsla(${hue}, 70%, 60%, 0.8)`
        })
        const borderColors = labels.map((_, index) => {
          const hue = (index * 137.5) % 360
          return `hsla(${hue}, 70%, 50%, 1)`
        })

        // Prepare detailed information for tooltips
        const moduleDetails = {}
        labels.forEach((moduleName) => {
          const details = moduleDetailsMap.get(moduleName)
          moduleDetails[moduleName] = {
            versions: Array.from(details.versions),
            deploymentCount: details.deploymentDates.length,
            lastDeployment:
              details.deploymentDates.length > 0
                ? new Date(Math.max(...details.deploymentDates.map((d) => new Date(d).getTime()))).toLocaleDateString(
                  "en-US",
                  { year: "numeric", month: "short", day: "numeric" },
                )
                : "No deployments",
            description: details.description,
          }
        })

        productDeploymentsChartData.value = {
          labels,
          datasets: [
            {
              label: "Number of Deployments",
              data,
              backgroundColor: backgroundColors,
              borderColor: borderColors,
              borderWidth: 2,
              moduleDetails, // Store details for tooltips
            },
          ],
        }
      } catch (error) {
        console.error("Error loading client technology stack data:", error)
        productDeploymentsChartData.value = { labels: [], datasets: [] }
      }
    }

    const loadRequestChangesScatterData = async (clientId) => {
      try {
        // Get all request of changes for this client
        const requestChangesRes = await requestOfChangeService.retrieve()
        const clientRequests = requestChangesRes.data.filter((req) => req.client?.id === clientId)

        if (clientRequests.length === 0) {
          requestChangesChartData.value = { datasets: [] }
          totalRequests.value = { basic: 0, intermediate: 0, advanced: 0 }
          return
        }

        // Préparer les points pour le scatter plot
        const basicPoints = []
        const intermediatePoints = []
        const advancedPoints = []

        // Initialize totals
        let totalBasic = 0
        let totalIntermediate = 0
        let totalAdvanced = 0

        for (const request of clientRequests) {
          if (request.createDate) {
            const date = new Date(request.createDate)
            const timestamp = date.getTime()
            const formattedDate = date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })

            // Get the customization level from the request
            let customizationLevel = ""
            if (request.customisationLevel?.id) {
              try {
                const customisationLevelData = await customisationLevelService.find(request.customisationLevel.id)
                customizationLevel =
                  customisationLevelData.level?.toLowerCase() ||
                  customisationLevelData.name?.toLowerCase() ||
                  customisationLevelData.type?.toLowerCase() ||
                  ""
              } catch (error) {
                console.error("Error fetching customization level:", error)
              }
            } else if (typeof request.customisationLevel === "string") {
              customizationLevel = request.customisationLevel.toLowerCase()
            }

            // Récupérer le produit et la version associés
            let productName = "Unknown Product"
            let productVersion = "Unknown Version"
            if (request.productVersion?.id) {
              try {
                const productVersionData = await productVersionService().find(request.productVersion.id)
                productName = productVersionData.product?.name || "Unknown Product"
                productVersion = productVersionData.version || "Unknown Version"
              } catch (error) {
                console.error(`Error fetching product version for request ${request.id}:`, error)
              }
            }

            // Récupérer les noms des modules affectés
            const moduleNames =
              request.moduleVersions?.map(
                (mv) =>
                  getModuleVersionWithModuleCached(mv.id).module?.name +
                  " v" +
                  getModuleVersionWithModuleCached(mv.id).version +
                  "\n" || "Unknown Module",
              ) || []

            // Créer un point pour le scatter plot
            const point = {
              x: timestamp,
              y: 1, // Toujours 1 pour un point
              r: 10, // Rayon du cercle
              date: formattedDate,
              requestId: request.id,
              productName,
              productVersion,
              moduleNames,
            }

            // Catégoriser en fonction du niveau
            if (customizationLevel.includes("basic")) {
              basicPoints.push(point)
              totalBasic++
            } else if (customizationLevel === "intermediate") {
              intermediatePoints.push(point)
              totalIntermediate++
            } else if (customizationLevel === "advanced") {
              advancedPoints.push(point)
              totalAdvanced++
            } else {
              // Si aucun niveau n'est reconnu, distribuer de manière équitable
              const requestIndex = clientRequests.indexOf(request)
              if (requestIndex % 3 === 0) {
                basicPoints.push(point)
                totalBasic++
              } else if (requestIndex % 3 === 1) {
                intermediatePoints.push(point)
                totalIntermediate++
              } else {
                advancedPoints.push(point)
                totalAdvanced++
              }
            }
          }
        }

        // Update totals
        totalRequests.value = {
          basic: totalBasic,
          intermediate: totalIntermediate,
          advanced: totalAdvanced,
        }

        // Préparer les données pour le graphique
        requestChangesChartData.value = {
          datasets: [
            {
              label: "Basic",
              data: basicPoints,
              backgroundColor: "rgba(255, 193, 7, 0.7)",
              borderColor: "rgba(255, 193, 7, 1)",
              borderWidth: 2,
              pointRadius: 8,
              pointHoverRadius: 12,
            },
            {
              label: "Intermediate",
              data: intermediatePoints,
              backgroundColor: "rgba(40, 167, 69, 0.7)",
              borderColor: "rgba(40, 167, 69, 1)",
              borderWidth: 2,
              pointRadius: 8,
              pointHoverRadius: 12,
            },
            {
              label: "Advanced",
              data: advancedPoints,
              backgroundColor: "rgba(220, 53, 69, 0.7)",
              borderColor: "rgba(220, 53, 69, 1)",
              borderWidth: 2,
              pointRadius: 8,
              pointHoverRadius: 12,
            },
          ],
        }
      } catch (error) {
        console.error("Error loading request changes scatter data:", error)
        requestChangesChartData.value = { datasets: [] }
        totalRequests.value = { basic: 0, intermediate: 0, advanced: 0 }
      }
    }

    const generateColors = (count) => {
      const baseColors = [
        "rgba(12, 45, 87, 0.8)",
        "rgba(149, 160, 244, 0.8)",
        "rgba(12, 166, 120, 0.8)",
        "rgba(245, 159, 0, 0.8)",
        "rgba(2, 136, 209, 0.8)",
        "rgba(28, 126, 214, 0.8)",
        "rgba(156, 39, 176, 0.8)",
        "rgba(255, 87, 34, 0.8)",
      ]

      const result = []
      for (let i = 0; i < count; i++) {
        if (i < baseColors.length) {
          result.push(baseColors[i])
        } else {
          const hue = ((i - baseColors.length) * 360) / (count - baseColors.length)
          result.push(`hsla(${hue}, 70%, 60%, 0.8)`)
        }
      }
      return result
    }

    const createCharts = () => {
      destroyCharts()
      createProductDeploymentsChart()
      createRequestChangesScatterChart()
      createClientsEvolutionChart()
    }

    const createProductDeploymentsChart = () => {
      // No chart creation needed - data is already prepared in loadClientTechnologyStackData
    }

    const createRequestChangesScatterChart = () => {
      if (
        requestChangesChart.value &&
        requestChangesChartData.value.datasets &&
        requestChangesChartData.value.datasets.length > 0
      ) {
        requestChangesChartInstance.value = new Chart(requestChangesChart.value, {
          type: "scatter",
          data: requestChangesChartData.value,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: "top",
                labels: {
                  usePointStyle: true,
                  padding: 20,
                },
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const point = context.raw
                    const tooltipLines = [
                      `Date: ${point.date}`,
                      `Product: ${point.productName || "Unknown"} - ${point.productVersion || "Unknown"}`,
                    ]

                    // Ajouter la liste des modules affectés
                    if (point.moduleNames && point.moduleNames.length > 0) {
                      tooltipLines.push("Modules Affected:")
                      point.moduleNames.forEach((module) => {
                        tooltipLines.push(`- ${module}`)
                      })
                    } else {
                      tooltipLines.push("No Modules Affected")
                    }

                    return tooltipLines.filter(Boolean)
                  },
                },
              },
            },
            scales: {
              x: {
                type: "linear",
                position: "bottom",
                title: {
                  display: true,
                  text: "Timeline",
                  font: {
                    size: 12,
                    weight: "bold",
                  },
                },
                ticks: {
                  callback: (value) => {
                    // Convert timestamp back to readable date
                    const date = new Date(value)
                    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
                  },
                },
              },
              y: {
                display: false, // Cacher l'axe Y car tous les points ont y=1
                min: 0,
                max: 2,
              },
            },
            elements: {
              point: {
                radius: 10,
                hoverRadius: 15,
                borderWidth: 2,
              },
            },
            interaction: {
              mode: "nearest",
              intersect: true,
            },
          },
        })
      }
    }

    const createClientsEvolutionChart = () => {
      // Clients Evolution Chart - Combinaison de barres et ligne cumulative
      if (clientsEvolutionChart.value && clientsEvolutionData.value.labels.length > 0) {
        clientsEvolutionChartInstance.value = new Chart(clientsEvolutionChart.value, {
          type: "bar",
          data: clientsEvolutionData.value,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: "top",
                labels: {
                  usePointStyle: true,
                  padding: 20,
                },
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const datasetLabel = context.dataset.label || ""
                    const value = context.parsed.y

                    if (datasetLabel.includes("Cumulative")) {
                      return `${datasetLabel}: ${value} client${value > 1 ? "s" : ""}`
                    } else {
                      const monthIndex = context.dataIndex
                      const clientNames = context.dataset.clientNames?.[monthIndex] || []

                      let tooltip = `${datasetLabel}: ${value} client${value > 1 ? "s" : ""}`

                      if (clientNames.length > 0) {
                        tooltip += "\nAdded clients:"
                        clientNames.forEach((name) => {
                          tooltip += `\n• ${name}`
                        })
                      }

                      return tooltip.split("\n")
                    }
                  },
                  title: (context) => `${context[0].label} ${currentYear.value}`,
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                  callback: (value) => (Number.isInteger(value) ? value : ""),
                },
                title: {
                  display: true,
                  text: "Number of clients",
                  font: {
                    size: 14,
                    weight: "bold",
                  },
                },
                grid: {
                  color: "rgba(0, 0, 0, 0.1)",
                },
              },
              x: {
                title: {
                  display: true,
                  text: `month - ${currentYear.value}`,
                  font: {
                    size: 14,
                    weight: "bold",
                  },
                },
                grid: {
                  display: false,
                },
              },
            },
            animation: {
              duration: 1000,
              easing: "easeInOutQuart",
            },
          },
        })
      }
    }

    const scrollLeft = () => {
      if (scrollContainer.value) {
        scrollContainer.value.scrollBy({ left: -320, behavior: "smooth" })
      }
    }

    const scrollRight = () => {
      if (scrollContainer.value) {
        scrollContainer.value.scrollBy({ left: 320, behavior: "smooth" })
      }
    }

    const checkScrollPosition = () => {
      if (scrollContainer.value) {
        const scrollLeft = scrollContainer.value.scrollLeft
        const scrollWidth = scrollContainer.value.scrollWidth
        const clientWidth = scrollContainer.value.clientWidth
        isAtStart.value = scrollLeft === 0
        isAtEnd.value = scrollLeft + clientWidth >= scrollWidth - 1
      }
    }

    const fetchContracts = async (clientId = null) => {
      try {
        contractsLoading.value = true
        const res = await productDeployementService.retrieve()
        let contractsData = res.data

        if (clientId) {
          contractsData = contractsData.filter((contract) => contract.client?.id === clientId)
        }

        contracts.value = await Promise.all(
          contractsData.map(async (contract) => {
            // Get deployment details for this contract
            const deploymentDetailsRes = await productDeployementDetailService.retrieve()
            const deploymentDetails = deploymentDetailsRes.data.filter(
              (detail) => detail.productDeployement?.id === contract.id,
            )

            // For each deployment detail, get module deployments
            const enrichedDeploymentDetails = await Promise.all(
              deploymentDetails.map(async (detail) => {
                const moduleDeployments = await fetchModuleDeploymentsByDetailId(detail.id)
                return {
                  ...detail,
                  moduleDeployments,
                }
              }),
            )

            return {
              ...contract,
              deploymentDetails: enrichedDeploymentDetails,
              clientName: contract.client?.name || "Unknown Client",
              productName: contract.product?.name || "Unknown Product",
            }
          }),
        )
      } catch (error) {
        console.error("Error fetching contracts:", error)
        alertService.showHttpError(error.response || error)
      } finally {
        contractsLoading.value = false
      }
    }

    const fetchModuleDeploymentsByDetailId = async (deploymentDetailId) => {
      try {
        const res = await moduleDeployementService.retrieve()
        const moduleDeployments = res.data.filter(
          (moduleDeployment) => moduleDeployment.productDeployementDetail?.id === deploymentDetailId,
        )

        // Enrich with module version and module information
        return await Promise.all(
          moduleDeployments.map(async (moduleDeployment) => {
            let moduleVersionInfo = null
            let moduleInfo = null

            if (moduleDeployment.moduleVersion?.id) {
              try {
                const moduleVersionRes = await moduleVersionService.find(moduleDeployment.moduleVersion.id)
                moduleVersionInfo = moduleVersionRes.data || moduleVersionRes

                if (moduleVersionInfo.module?.id) {
                  const moduleRes = await moduleService.find(moduleVersionInfo.module.id)
                  moduleInfo = moduleRes.data || moduleRes
                }
              } catch (error) {
                console.error("Error fetching module version or module:", error)
              }
            }

            return {
              ...moduleDeployment,
              moduleVersion: moduleVersionInfo,
              module: moduleInfo,
            }
          }),
        )
      } catch (error) {
        console.error("Error fetching module deployments:", error)
        return []
      }
    }

    const toggleContractExpansion = (contractId) => {
      const expanded = new Set(expandedContracts.value)
      if (expanded.has(contractId)) {
        expanded.delete(contractId)
      } else {
        expanded.add(contractId)
      }
      expandedContracts.value = expanded
    }

    const toggleDeploymentDetailExpansion = (detailId) => {
      const expanded = new Set(expandedDeploymentDetails.value)
      if (expanded.has(detailId)) {
        expanded.delete(detailId)
      } else {
        expanded.add(detailId)
      }
      expandedDeploymentDetails.value = expanded
    }

    const formatDate = (dateString) => {
      if (!dateString) return "N/A"
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    }

    const showModuleDetails = (moduleName) => {
      const moduleDetails = productDeploymentsChartData.value.datasets[0]?.moduleDetails?.[moduleName]
      if (moduleDetails) {
        // Get all deployment details for this module to show versions with dates
        const moduleDeployments = []

        // Find all deployments for this module
        contracts.value.forEach((contract) => {
          contract.deploymentDetails?.forEach((detail) => {
            detail.moduleDeployments?.forEach((moduleDeployment) => {
              if (moduleDeployment.moduleVersion?.module?.name === moduleName) {
                moduleDeployments.push({
                  version: moduleDeployment.moduleVersion.version || "Unknown",
                  date: detail.startDeployementDate || "Unknown date",
                  deploymentId: detail.id,
                  status: detail.status || "Active",
                })
              }
            })
          })
        })

        // Sort by date (newest first)
        moduleDeployments.sort((a, b) => new Date(b.date) - new Date(a.date))

        selectedModuleData.value = {
          name: moduleName,
          description: moduleDetails.description,
          totalVersions: moduleDetails.versions.length,
          deployments: moduleDeployments,
          lastDeployment: moduleDetails.lastDeployment,
        }
        showModulePopup.value = true
      }
    }

    const closeModulePopup = () => {
      showModulePopup.value = false
      selectedModuleData.value = null
    }

    onMounted(async () => {
      await fetchClients()
      await loadClientsEvolutionData()
      createCharts()
      checkScrollPosition()
      await fetchModuleOptions()
      await fetchModuleVersionOptions()
    })

    const fetchModuleOptions = async () => {
      try {
        const res = await moduleService.retrieve()
        moduleOptions.value = res.data
      } catch (err) {
        alertService.showHttpError(err.response)
      }
    }

    const fetchModuleVersionOptions = async () => {
      try {
        const res = await moduleVersionService.retrieve()
        moduleVersionOptions.value = res.data
      } catch (err) {
        alertService.showHttpError(err.response)
      }
    }

    const getModuleVersionWithModuleCached = (moduleVersionId) => {
      // 1. Trouver la version de module dans le cache
      const moduleVersion = moduleVersionOptions.value.find((mv) => mv.id === moduleVersionId)
      if (!moduleVersion) return null

      // 2. Trouver le module associé dans le cache
      const module = moduleOptions.value.find((m) => m.id === moduleVersion.module?.id)

      // 3. Fusionner les données
      return {
        ...moduleVersion,
        module: module ? { ...module } : null,
      }
    }

    const moduleOptions = ref([])
    const moduleVersionOptions = ref([])

    return {
      scrollContainer,
      clients,
      isAtStart,
      isAtEnd,
      scrollLeft,
      scrollRight,
      checkScrollPosition,
      loading,
      selectedClient,
      clientProductDeployments,
      selectClient,
      closeCharts,
      productDeploymentsChart,
      requestChangesChart,
      clientsEvolutionChart,
      productDeploymentsChartData,
      requestChangesChartData,
      clientsEvolutionData,
      totalRequests,
      currentYear,
      t$: t,
      contracts,
      contractsLoading,
      expandedContracts,
      expandedDeploymentDetails,
      toggleContractExpansion,
      toggleDeploymentDetailExpansion,
      formatDate,
      fetchModuleDeploymentsByDetailId,
      showModulePopup,
      selectedModuleData,
      showModuleDetails,
      closeModulePopup,
    }
  },
})
