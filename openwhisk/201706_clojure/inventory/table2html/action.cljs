(ns action.core (:require clojure.string))

(def header (js* "require('fs').readFileSync(__dirname + '/../../../header')"))
(def footer (js* "require('fs').readFileSync(__dirname + '/../../../footer')"))


(defn cljsMain [params] (
    let [
      cljParams (js->clj params)
      htmlTable (get cljParams "html")
      bootstrapTable (clojure.string/replace htmlTable
          "<table>"
          "<table class=\"table table-striped\"> ")
      delme (prn "Parameter HTML:")
      delme (prn htmlTable)
    ]

    {"html" (clojure.string/join [header (clojure.string/replace bootstrapTable "$$$" "\"") footer])}
  )
)
