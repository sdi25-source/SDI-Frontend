/*!
 * purecounter.js - A simple yet configurable native javascript counter which you can count on.
 * Author: Stig Rex
 * Version: 1.5.0
 * Url: https://github.com/srexi/purecounterjs
 * License: MIT
 */
!(function (e, t) {
  'object' == typeof exports && 'object' == typeof module
    ? (module.exports = t())
    : 'function' == typeof define && define.amd
      ? define([], t)
      : 'object' == typeof exports
        ? (exports.PureCounter = t())
        : (e.PureCounter = t());
})(self, function () {
  return (
    (e = {
      638: function (e) {
        function t(e, t, r) {
          return t in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : (e[t] = r), e;
        }
        function r(e) {
          return (
            (function (e) {
              if (Array.isArray(e)) return n(e);
            })(e) ||
            (function (e) {
              if (('undefined' != typeof Symbol && null != e[Symbol.iterator]) || null != e['@@iterator']) return Array.from(e);
            })(e) ||
            (function (e, t) {
              if (e) {
                if ('string' == typeof e) return n(e, t);
                var r = Object.prototype.toString.call(e).slice(8, -1);
                return (
                  'Object' === r && e.constructor && (r = e.constructor.name),
                  'Map' === r || 'Set' === r
                    ? Array.from(e)
                    : 'Arguments' === r || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
                      ? n(e, t)
                      : void 0
                );
              }
            })(e) ||
            (function () {
              throw new TypeError(
                'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.',
              );
            })()
          );
        }
        function n(e, t) {
          (null == t || t > e.length) && (t = e.length);
          for (var r = 0, n = new Array(t); r < t; r++) n[r] = e[r];
          return n;
        }
        function o(e) {
          var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
            r = {};
          for (var n in e)
            if (t == {} || t.hasOwnProperty(n)) {
              var o = c(e[n]);
              (r[n] = o), n.match(/duration|pulse/) && (r[n] = 'boolean' != typeof o ? 1e3 * o : o);
            }
          return Object.assign({}, t, r);
        }
        function i(e, t) {
          var r = (t.end - t.start) / (t.duration / t.delay),
            n = 'inc';
          t.start > t.end && ((n = 'dec'), (r *= -1));
          var o = c(t.start);
          (e.innerHTML = u(o, t)), !0 === t.once && e.setAttribute('data-purecounter-duration', 0);
          var i = setInterval(function () {
            var a = (function (e, t) {
              var r = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 'inc';
              return (e = c(e)), (t = c(t)), parseFloat('inc' === r ? e + t : e - t);
            })(o, r, n);
            (e.innerHTML = u(a, t)),
              (((o = a) >= t.end && 'inc' == n) || (o <= t.end && 'dec' == n)) &&
                ((e.innerHTML = u(t.end, t)),
                t.pulse &&
                  (e.setAttribute('data-purecounter-duration', 0),
                  setTimeout(function () {
                    e.setAttribute('data-purecounter-duration', t.duration / 1e3);
                  }, t.pulse)),
                clearInterval(i));
          }, t.delay);
        }
        function a(e, t) {
          return Math.pow(e, t);
        }
        function u(e, t) {
          var r = { minimumFractionDigits: t.decimals, maximumFractionDigits: t.decimals },
            n = 'string' == typeof t.formater ? t.formater : void 0;
          return (
            (e = (function (e, t) {
              if (t.filesizing || t.currency) {
                e = Math.abs(Number(e));
                var r = 1e3,
                  n = t.currency && 'string' == typeof t.currency ? t.currency : '',
                  o = t.decimals || 1,
                  i = ['', 'K', 'M', 'B', 'T'],
                  u = '';
                t.filesizing && ((r = 1024), (i = ['bytes', 'KB', 'MB', 'GB', 'TB']));
                for (var c = 4; c >= 0; c--)
                  if ((0 === c && (u = ''.concat(e.toFixed(o), ' ').concat(i[c])), e >= a(r, c))) {
                    u = ''.concat((e / a(r, c)).toFixed(o), ' ').concat(i[c]);
                    break;
                  }
                return n + u;
              }
              return parseFloat(e);
            })(e, t)),
            (function (e, t) {
              if (t.formater) {
                var r = t.separator ? ('string' == typeof t.separator ? t.separator : ',') : '';
                return 'en-US' !== t.formater && !0 === t.separator
                  ? e
                  : ((n = r),
                    e.replace(
                      /^(?:(\d{1,3},(?:\d{1,3},?)*)|(\d{1,3}\.(?:\d{1,3}\.?)*)|(\d{1,3}(?:\s\d{1,3})*))([\.,]?\d{0,2}?)$/gi,
                      function (e, t, r, o, i) {
                        var a = '',
                          u = '';
                        if (
                          (void 0 !== t
                            ? ((a = t.replace(new RegExp(/,/gi, 'gi'), n)), (u = ','))
                            : void 0 !== r
                              ? (a = r.replace(new RegExp(/\./gi, 'gi'), n))
                              : void 0 !== o && (a = o.replace(new RegExp(/ /gi, 'gi'), n)),
                          void 0 !== i)
                        ) {
                          var c = ',' !== u && ',' !== n ? ',' : '.';
                          a += void 0 !== i ? i.replace(new RegExp(/\.|,/gi, 'gi'), c) : '';
                        }
                        return a;
                      },
                    ));
              }
              var n;
              return e;
            })((e = t.formater ? e.toLocaleString(n, r) : parseInt(e).toString()), t)
          );
        }
        function c(e) {
          return /^[0-9]+\.[0-9]+$/.test(e)
            ? parseFloat(e)
            : /^[0-9]+$/.test(e)
              ? parseInt(e)
              : /^true|false/i.test(e)
                ? /^true/i.test(e)
                : e;
        }
        function f(e) {
          for (var t = e.offsetTop, r = e.offsetLeft, n = e.offsetWidth, o = e.offsetHeight; e.offsetParent; )
            (t += (e = e.offsetParent).offsetTop), (r += e.offsetLeft);
          return (
            t >= window.pageYOffset &&
            r >= window.pageXOffset &&
            t + o <= window.pageYOffset + window.innerHeight &&
            r + n <= window.pageXOffset + window.innerWidth
          );
        }
        function s() {
          return (
            'IntersectionObserver' in window &&
            'IntersectionObserverEntry' in window &&
            'intersectionRatio' in window.IntersectionObserverEntry.prototype
          );
        }
        e.exports = function () {
          var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
            n = {
              start: 0,
              end: 100,
              duration: 2e3,
              delay: 10,
              once: !0,
              pulse: !1,
              decimals: 0,
              legacy: !0,
              filesizing: !1,
              currency: !1,
              separator: !1,
              formater: 'us-US',
              selector: '.purecounter',
            },
            a = o(e, n);
          function d() {
            var e = document.querySelectorAll(a.selector);
            if (0 !== e.length)
              if (s()) {
                var t = new IntersectionObserver(p.bind(this), { root: null, rootMargin: '20px', threshold: 0.5 });
                e.forEach(function (e) {
                  t.observe(e);
                });
              } else
                window.addEventListener &&
                  (l(e),
                  window.addEventListener(
                    'scroll',
                    function (t) {
                      l(e);
                    },
                    { passive: !0 },
                  ));
          }
          function l(e) {
            e.forEach(function (e) {
              !0 === v(e).legacy && f(e) && p([e]);
            });
          }
          function p(e, t) {
            e.forEach(function (e) {
              var r = e.target || e,
                n = v(r);
              if (n.duration <= 0) return (r.innerHTML = u(n.end, n));
              if ((!t && !f(e)) || (t && e.intersectionRatio < 0.5)) {
                var o = n.start > n.end ? n.end : n.start;
                return (r.innerHTML = u(o, n));
              }
              setTimeout(function () {
                return i(r, n);
              }, n.delay);
            });
          }
          function v(e) {
            var n = a,
              i = [].filter.call(e.attributes, function (e) {
                return /^data-purecounter-/.test(e.name);
              });
            return o(
              0 != i.length
                ? Object.assign.apply(
                    Object,
                    [{}].concat(
                      r(
                        i.map(function (e) {
                          var r = e.name,
                            n = e.value;
                          return t({}, r.replace('data-purecounter-', '').toLowerCase(), c(n));
                        }),
                      ),
                    ),
                  )
                : {},
              n,
            );
          }
          d();
        };
      },
    }),
    (t = {}),
    (r = (function r(n) {
      var o = t[n];
      if (void 0 !== o) return o.exports;
      var i = (t[n] = { exports: {} });
      return e[n](i, i.exports, r), i.exports;
    })(638)),
    r
  );
  var e, t, r;
});
//# sourceMappingURL=purecounter_vanilla.js.map
