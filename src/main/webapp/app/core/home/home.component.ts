import { type ComputedRef, defineComponent, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import type LoginService from '@/account/login.service';

export default defineComponent({
  name: 'HomeComponent',
  data() {
    const loginService = inject<LoginService>('loginService');

    const authenticated = inject<ComputedRef<boolean>>('authenticated');
    const username = inject<ComputedRef<string>>('currentUsername');

    const openLogin = () => {
      loginService.openLogin();
    };
    return {
      authenticated,
      username,
      openLogin,
      t$: useI18n().t,
      activeTab: 'deployments',
      deploymentSearch: '',
      deploymentClientFilter: '',
      deploymentProductFilter: '',
      clientSearch: '',
      clientSizeFilter: '',
      clientTypeFilter: '',
      deployments: [
        { id: 'DEP-001', client: 'Bank of Africa', product: 'Payment Gateway', version: 'v2.3.1', date: '2023-04-12', status: 'Completed' },
        {
          id: 'DEP-002',
          client: 'Maroc Telecom',
          product: 'Customer Portal',
          version: 'v1.8.0',
          date: '2023-04-10',
        },
        { id: 'DEP-003', client: 'Royal Air Maroc', product: 'Booking System', version: 'v3.2.1', date: '2023-04-08', status: 'Pending' },
        { id: 'DEP-004', client: 'OCP Group', product: 'Analytics Dashboard', version: 'v2.0.0', date: '2023-04-05', status: 'Completed' },
        {
          id: 'DEP-005',
          client: 'Attijariwafa Bank',
          product: 'Mobile Banking',
          version: 'v4.1.2',
          date: '2023-04-01',
        },
      ],
      clients: [
        { id: 'CL-001', name: 'Bank of Africa', type: 'Banking', size: 'Large', location: 'Casablanca', email: 'bank@gmail.com' },
        { id: 'CL-002', name: 'Maroc Telecom', type: 'Telecom', size: 'Large', location: 'Rabat', email: 'telecom@gmail.com' },
        { id: 'CL-003', name: 'Royal Air Maroc', type: 'Aviation', size: 'Medium', location: 'Casablanca', email: 'air@gmail.com' },
        { id: 'CL-004', name: 'OCP Group', type: 'Industry', size: 'Large', location: 'Safi', email: 'ocp@gmail.com' },
        { id: 'CL-005', name: 'Attijariwafa Bank', type: 'Banking', size: 'Large', location: 'Casablanca', email: 'bank@gmail.com' },
      ],
      products: [
        { id: 'PR-001', name: 'Payment Gateway' },
        { id: 'PR-002', name: 'Customer Portal' },
        { id: 'PR-003', name: 'Booking System' },
        { id: 'PR-004', name: 'Analytics Dashboard' },
        { id: 'PR-005', name: 'Mobile Banking' },
      ],
    };
  },
  computed: {
    filteredDeployments() {
      return this.deployments.filter(deployment => {
        const matchesSearch =
          deployment.id.toLowerCase().includes(this.deploymentSearch.toLowerCase()) ||
          deployment.client.toLowerCase().includes(this.deploymentSearch.toLowerCase()) ||
          deployment.product.toLowerCase().includes(this.deploymentSearch.toLowerCase());
        const matchesClient = !this.deploymentClientFilter || deployment.client === this.deploymentClientFilter;
        const matchesProduct = !this.deploymentProductFilter || deployment.product === this.deploymentProductFilter;
        return matchesSearch && matchesClient && matchesProduct;
      });
    },
    filteredClients() {
      return this.clients.filter(client => {
        const matchesSearch =
          client.id.toLowerCase().includes(this.clientSearch.toLowerCase()) ||
          client.name.toLowerCase().includes(this.clientSearch.toLowerCase());
        const matchesSize = !this.clientSizeFilter || client.size === this.clientSizeFilter;
        const matchesType = !this.clientTypeFilter || client.type === this.clientTypeFilter;
        return matchesSearch && matchesSize && matchesType;
      });
    },
  },
});
