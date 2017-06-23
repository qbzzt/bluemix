(ns action.core (:require clojure.string))

(def header (js* "require('fs').readFileSync(__dirname + '/../../../header')"))
(def footer (js* "require('fs').readFileSync(__dirname + '/../../../footer')"))


(defn cljsMain [params] (
    let [
      cljParams (js->clj params)
      data (get cljParams "data")
      html (get data "html")
    ]

    {"html" (clojure.string/join [header html footer])}
  )
)
